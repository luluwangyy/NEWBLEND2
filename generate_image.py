import os
import sys
import json
import replicate

# Set your API token
REPLICATE_API_TOKEN = 'r8_c0dzM9GNvKVTvyQGyA4YjhyzpDUigRu01VRf1'
os.environ["REPLICATE_API_TOKEN"] = REPLICATE_API_TOKEN

def generate_image(prompt):
    output = replicate.run(
        "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
        input={"prompt": prompt}
    )
    return output

if __name__ == "__main__":
    prompt = sys.argv[1]
    result = generate_image(prompt)
    print(result)  # Directly print the result which should be the URL