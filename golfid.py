import os
import base64
import golfball
from openai import OpenAI
from dotenv import load_dotenv
import shutil
import sys
import time
#import xsecrets



start_time = time.time()
print("[{\"", end="")
print(f"Start time: {start_time}", end="")
print("\"},", end="")
print("{\"name\": \"Starting to process", flush=True, end="")
print("\"},")
# Load environment variables

load_dotenv()


# XAI_API_KEY = os.getenv("XAI_API_KEY")
# if not XAI_API_KEY:
#     print("Error: XAI_API_KEY not set in .env file", file=sys.stderr, flush=True)
#     sys.exit(1)
# Initialize the OpenAI client
#print("{\"name\": \"", end="")
XAI_API_KEY = os.getenv("XAI_API_KEY")
#print(f"OpenAI ::", XAI_API_KEY, end="")
#print("\"},", end="")
if XAI_API_KEY == '':
    #if "".__eq__(XAI_API_KEY):
    #XAI_API_KEY = xsecrets.xXAI_API_KEY
    print(f"Error initializing OpenAI, key blank.")
    exit
else:
    try:
        #print(f"Error initializing OpenAI, key NOT blank?")
        #print(f"OpenAI ::", XAI_API_KEY)
        client = OpenAI(
            api_key=XAI_API_KEY,
            base_url="https://api.x.ai/v1",
        )
        print("{\"name\": \"", end="")
        print("OpenAI client initialized successfully", flush=True, end="")
        print("\"},", end="")

    except Exception as e:
        #rint(" skey=",stub)
        print(f"OpenAI :: ",XAI_API_KEY, file=sys.stderr, flush=True)
        #print(f"Error initializing OpenAI client: {str(e)} ", file=sys.stderr, flush=True)
        #print("\"},")
        sys.exit(1)

    # Function to encode image to base64
    def encode_image(filepath):
        try:
            with open(filepath, "rb") as image_file:
                print("{\"name\": \"", end="")
                print(f"Encoding image: {filepath}", flush=True, end="")
                print("\"}", end="")
                return base64.b64encode(image_file.read()).decode("utf-8")
        except FileNotFoundError:
            print(f"Error: File {filepath} not found", file=sys.stderr, flush=True)
            return None
        except Exception as e:
            print(f"Error encoding image {filepath}: {str(e)}", file=sys.stderr, flush=True)
            return None
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
                max_tokens=300,
            )
            #time.sleep(3) 
            str_with_brand_cr_lf = response.choices[0].message.content
            str_with_brand = str_with_brand_cr_lf.replace("\n", "")
           # print("{\"api_result\": \"", end="")
           # print(f"API response received for {image_path}: {str_with_brand}", flush=True, end="")
           # print("\"},", end="")

            #str_with_brand = response.choices[0].message.content
            if "".__eq__(str_with_brand):
                exit
            else:
                golfballtype_space = golfball.check_golf_ball_brand(str_with_brand)
                golfballtype = golfballtype_space.replace(" ", "-")
                print("{\"name\": \"", end="")
                print(f"Identified brand: {golfballtype}", flush=True , end="")
                print("\"},")
                destination_directory = os.path.join("uploads", golfballtype.lower())
                os.makedirs(destination_directory, exist_ok=True)
                destination_path = os.path.join(destination_directory, filename)
                
                try:
                    shutil.move(image_path, destination_path)
                    #print(f"Moved {image_path} to {destination_path}", flush=True)
                except Exception as e:
                    print(f"Error moving {image_path} to {destination_path}: {str(e)}", file=sys.stderr, flush=True)
                    continue
                    
                except Exception as e:
                    print(f"API call failed for {image_path}: {str(e)}", file=sys.stderr, flush=True)
                    continue



    if fileCount == 0:
        print("\"", end="")
        print("No uploaded files found to process. Please upload a golf ball image first.", file=sys.stderr, flush=True, end="")
        print("}]", end="")
        
    else:
        #print(f"Processed {fileCount} file(s) successfully", flush=True)
        end_time = time.time()
        elapsed_time = end_time - start_time
        #print("Processed ", fileCount, " ball pics.")
        #print(f"Start time: {start_time}")
        #print(f"End time: {end_time}")
        #print(f"Elapsed time: {elapsed_time:.6f} seconds")
        num_of_secs=elapsed_time
        per = fileCount / num_of_secs
        print("{\"", end="")
        print(f"Balls per second {per:.6f} b/s : ", end="")
        print(f"Seconds per ball  {1/per:.6f} s/b\"", end="")
        print("}]")
sys.exit(0)
