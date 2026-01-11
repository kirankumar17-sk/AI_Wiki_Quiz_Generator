import scraper
import llm_service

# --- HARDCODED URL FOR TESTING ---
test_url = "https://en.wikipedia.org/wiki/Albert_Einstein" 

print(f"1. Starting Scraper for: {test_url}...")
try:
    # 1. Test Scraping
    scraped_data = scraper.scrape_wikipedia(test_url)
    print("✅ Scraping Successful!")
    print(f"Title: {scraped_data['title']}")
    print(f"Summary length: {len(scraped_data['summary'])} characters")
    
    # 2. Test AI Generation
    print("\n2. Sending text to Gemini AI (this may take 10 seconds)...")
    quiz_output = llm_service.generate_quiz_content(scraped_data['full_text'])
    
    if quiz_output:
        print("✅ AI Generation Successful!")
        print("\n--- SAMPLE QUIZ QUESTION ---")
        print(quiz_output['quiz'][0]) # Prints just the first question
    else:
        print("❌ AI Generation Failed (returned None). Check API Key.")

except Exception as e:
    print(f"❌ Error occurred: {e}")