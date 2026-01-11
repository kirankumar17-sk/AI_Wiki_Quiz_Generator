from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import JsonOutputParser
from pydantic import BaseModel, Field
from typing import List
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# --- Data Structures for Output ---

class QuizItem(BaseModel):
    question: str = Field(description="The quiz question text")
    options: List[str] = Field(description="A list of 4 options (A, B, C, D)")
    answer: str = Field(description="The correct answer text, must match one of the options")
    difficulty: str = Field(description="Difficulty level: easy, medium, or hard")
    explanation: str = Field(description="A short explanation of why the answer is correct")

class Entities(BaseModel):
    people: List[str] = Field(description="List of key people mentioned")
    organizations: List[str] = Field(description="List of key organizations mentioned")
    locations: List[str] = Field(description="List of key locations mentioned")

class QuizOutput(BaseModel):
    key_entities: Entities
    quiz: List[QuizItem]
    related_topics: List[str] = Field(description="3 related Wikipedia topic titles")

# --- Main Generation Function ---

def generate_quiz_content(text_content: str):
    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        print("Error: GOOGLE_API_KEY is missing in .env file")
        return None

    # Initialize Gemini
    # "gemini-pro" is the standard stable model for the free tier
    llm = ChatGoogleGenerativeAI(
        model="gemini-2.5-flash", 
        temperature=0.3,
        google_api_key=api_key
    )

    # Set up the JSON parser
    parser = JsonOutputParser(pydantic_object=QuizOutput)

    # Define the prompt
    prompt = PromptTemplate(
        template="""
        You are an intelligent AI teacher. Your goal is to generate a structured quiz based strictly on the provided text.

        TEXT CONTENT:
        {text_content}

        INSTRUCTIONS:
        1. Analyze the text and extract key entities (People, Organizations, Locations).
        2. Create 5 multiple-choice questions based on the text.
        3. Each question must have 4 options, one correct answer, a difficulty level, and an explanation.
        4. Suggest 3 related Wikipedia topics for further reading.

        STRICT OUTPUT FORMAT:
        You must return ONLY a valid JSON object matching the following structure:
        {format_instructions}
        """,
        input_variables=["text_content"],
        partial_variables={"format_instructions": parser.get_format_instructions()},
    )

    # Create the chain
    chain = prompt | llm | parser

    try:
        # Run the chain
        result = chain.invoke({"text_content": text_content})
        return result
    except Exception as e:
        print(f"LLM Generation Error: {e}")
        return None