import os
import base64
import golfball
import secrets
from openai import OpenAI
from dotenv import load_dotenv
import fs
import shutil 

# Load environment variables
load_dotenv()
#XAI_API_KEY = os.getenv("XAI_API_KEY")


# Function to encode image to base64
def encode_image(filepath):
    try:
        with open(filepath, "rb") as image_file:
            return base64.b64encode(image_file.read()).decode("utf-8")
    except FileNotFoundError:
        print(f"Error: File {filepath} not found")
        return None
    except Exception as e:
        print(f"Error encoding image {filepath}: {str(e)}")
        return None

#print("XAI_API_KEY = ", secrets.XAI_API_KEY)

# Initialize the OpenAI client with xAI's API endpoint
client = OpenAI(
    api_key=secrets.XAI_API_KEY,
    base_url="https://api.x.ai/v1",
)

directory_path = 'uploads'
fileCount = 0
for filename in os.listdir(directory_path):
    image_path = os.path.join(directory_path, filename)
    #print("file name : ", filename)
    
    if (os.path.isdir(image_path)):
        image_path=image_path
        #print("Directory :",image_path)
        # skip
    else:
        fileCount+=1
        #print ("File :",image_path)
        # Encode the image
        base64_image = encode_image(image_path)
        #print("got base 64 of image path  :", image_path)
        #Create a chat completion request with the image
        response = client.chat.completions.create(
            model="grok-4",  # Use Grok 4 for image processing
            messages=[
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": "Classify the main object in this image including brand name. Provide the object name and a confidence score (0-100%)."},
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/jpeg;base64,{base64_image}"
                            },
                        },
                    ],
                }
            ],
            max_tokens=200,
        )

        # Print the response
        #print(response)
        str_with_brand  = response.choices[0].message.content
        #str_with_brand  = "Titleist Golf Ball"
        golfballtype=golfball.check_golf_ball_brand(str_with_brand)
        #print (golfballtype)
        
        #print(response.choices[0].message.content)
        destination_directory = os.path.join("uploads", golfballtype.lower(), filename)
        print (golfballtype, " identified as brand : ", golfballtype, " moved to folder.")
        shutil.move(image_path, destination_directory)

        # text = 'gary is male, 25 years old and weighs 68.5 kilograms'
        # pattern = '%{WORD:name} is %{WORD:gender}, %{NUMBER:age} years old and weighs %{NUMBER:weight} kilograms'
        # grok = Grok(pattern)
        # print (grok.match(text))
        #print ("done")
        if (fileCount == 0):
            print ("No uploaded files found to process.  Please upload a golfball image first.")