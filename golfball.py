

#Here's a Python script to check if a string contains popular golf ball brands:
#python
def check_golf_ball_brand(text):
    # List of popular golf ball brands
    golf_brands = [
        'Titleist', 'Callaway', 'Bridgestone', 'TaylorMade', 'Srixon',
        'Wilson', 'Mizuno', 'Vice', 'Volvik', 'Nitro', 'Pinnacle', 'Top Flite'
    ]
    #print ("Got it:", text)
    # Convert text to lowercase for case-insensitive matching
    text = text.lower()
    
    # Check for each brand in the text
    found_brands = [brand for brand in golf_brands if brand.lower() in text]
    length_of_array2 = len(found_brands)
    #print ("fb em:", found_brands)
    #print ("length_of_array2:", length_of_array2)
    
    golfballtypes = ""
    if found_brands:
        golfballtypes= f"Found golf ball brands: {', '.join(found_brands)}"
    else:
        golfballtypes= "No popular golf ball brands found in the text."
    
    #print("golfballtypes:", golfballtypes)
    
    golf_ball_brand = ""
    if length_of_array2 == 1:
        #print ("fb it:", found_brands[0])
        golf_ball_brand=found_brands[0]
    #else:
        #print ("not fb it:")
    
    return golf_ball_brand

# Example usage
# test_strings = [
#     "I found a Titleist ball on the course",
#     "Using Callaway and TaylorMade golf balls",
#     "No brand mentioned here",
#     "Srixon balls are great for distance"
# ]

# for test in test_strings:
#     print(f"Text: {test}")
#     print(check_golf_ball_brand(test))
#     print()