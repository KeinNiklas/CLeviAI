import requests
import os

# Create a dummy text file
with open("test_doc.txt", "w") as f:
    f.write("This is a test document to verify the API.")

files = {'files': open('test_doc.txt', 'rb')}
data = {'language': 'en'}

print("Sending analyze request...")
try:
    response = requests.post("http://localhost:8000/analyze-document", files=files, data=data)
    print(f"Status Code: {response.status_code}")
    if response.ok:
        print("Success! Topics received:")
        print(response.json())
    else:
        print("Error:", response.text)
except Exception as e:
    print("Request failed:", e)
finally:
    files['files'].close()
    if os.path.exists("test_doc.txt"):
        os.remove("test_doc.txt")
