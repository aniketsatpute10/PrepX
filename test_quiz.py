import urllib.request
import json
import time

# Wait for server to be fully ready
time.sleep(2)

try:
    url = 'http://localhost:5000/api/quiz/questions?role=fullstack&difficulty=easy&limit=2'
    req = urllib.request.Request(url)
    req.add_header('Content-Type', 'application/json')
    
    with urllib.request.urlopen(req, timeout=10) as response:
        data = response.read().decode('utf-8')
        questions = json.loads(data)
        
        print(f"✅ SUCCESS! Generated {len(questions)} questions")
        print("\nFirst question:")
        print(json.dumps(questions[0], indent=2))
        
except urllib.error.HTTPError as e:
    error_data = e.read().decode('utf-8')
    print(f"❌ HTTP ERROR {e.code}: {e.reason}")
    print("\nResponse:")
    print(error_data)
except Exception as e:
    print(f"❌ ERROR: {e}")
    import traceback
    traceback.print_exc()
