
# AI based Question-Answer Generator
This is an AI Test Generation Bot that accepts multiple PDF files as input, extracts relevant information and generates objective or subjective test questions along with answers based on user-specified topics, chapters, subjects

It uses Google Generative AI API.

I have provided the .env file as well with the `GOOGLE_API_KEY` for easy evaluation of my project.

The summary report is also present in this repo.

## Tech-Stack used
React.js, Python, Flask

## Setup
1. Clone the Repository 
   ```bash
   git clone https://github.com/t4nm4y/pdf-QA-AI
   ```
2. Install Dependencies
   
   Frontend:

   Make sure node.js & npm is installed on your system.
   ```bash
   cd pdf-QA-AI/client
   npm install
   ```

   Backend:
   
   Make sure python and pip is installed on your system.
   ```bash
   cd pdf-QA-AI/server
   pip install -r requirements.txt
   ```

3. Set Up Google API Key:
   
   I have already provided it in the .env file.
   
   In case it is not there create a .env file in the server directory and paste your key, value there as:

    GOOGLE_API_KEY=your_key

4. Run the application:

   (Run Backend and Frontend in separate terminals.)

   Backend:
   ```bash
   cd pdf-QA-AI/server
   python .\server.py
   ```
   
   Frontend:
   ```bash
   cd pdf-QA-AI/client
   npm start
   ```
   The website will run at http://localhost:3000/

## Explaination of my approach:
1. I took the input of multiple pdf files. Extracted all the text into a single variable.
2. Created chunks out of the combined text.
3. Created embeddings of these chunks using Google's models/embedding-001
4. Created a vector store and stored it on ChromaDb
5. Took input from the user for the specific topic. Based on the topic, ran a query on chromadb to extract relevant text passages only.
6. Took propmt from the user for the type and no. of questions to generate.
7. Them used Google's LLM model 'gemini-pro' to run the query on relevant passage.
8. Finally, the QA test can be extracted in HTML or PDF format.


## Demo Video:
https://youtu.be/2vfdoFLPD28

## Screenshots:

![Screenshot_20231230_213818](https://github.com/t4nm4y/pdf-QA-AI/assets/88146479/40091f25-ce96-4824-9eb7-0dfeb617d280)

![image](https://github.com/t4nm4y/pdf-QA-AI/assets/88146479/d0e62476-647f-410d-914e-e2f7b0bd1a18)

![image](https://github.com/t4nm4y/pdf-QA-AI/assets/88146479/dd00e809-86dc-46d4-a86c-d2ed36aee15d)

![image](https://github.com/t4nm4y/pdf-QA-AI/assets/88146479/37e7467e-deab-4c91-907a-72006a107c3c)

Exported documents:

HTML format:

![image](https://github.com/t4nm4y/pdf-QA-AI/assets/88146479/6d90b754-d0d9-4c68-8b19-92fc3b099960)

Pdf format:

![image](https://github.com/t4nm4y/pdf-QA-AI/assets/88146479/292c5108-8ab2-4ea1-95a8-954b29be840d)



### Made with ❤️ by Tanmay Kumar.
