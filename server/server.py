from flask import Flask, request, jsonify
import os
from dotenv import load_dotenv
from flask_cors import CORS

# Load environment variables
load_dotenv() 

# Import other required libraries
import chromadb
import google.generativeai as genai
import markdown
from chromadb import Documents, EmbeddingFunction, Embeddings
import PyPDF2
from langchain.text_splitter import CharacterTextSplitter

#configuration
GOOGLE_API_KEY=os.getenv("GOOGLE_API_KEY") 
genai.configure(api_key=GOOGLE_API_KEY)


app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

#required functions

#function to generate chunks
def get_chunks(text):
    texts = CharacterTextSplitter(
        separator="\n",
        chunk_size=3000,
        chunk_overlap=300,
        length_function=len,
    ).split_text(text)
    return texts

# Function to extract text from a PDF file
def extract_text_from_pdf(pdf_file):
    text = ""
    pdf_reader = PyPDF2.PdfReader(pdf_file)
    num_pages = len(pdf_reader.pages)
    for page_num in range(num_pages):
        text += pdf_reader.pages[page_num].extract_text()
    return text

#to generate embeddings and vector store
class GeminiEmbeddingFunction(EmbeddingFunction):
  def __call__(self, input: Documents) -> Embeddings:
    model = 'models/embedding-001'
    title = "QA generation"
    return genai.embed_content(model=model,
                                content=input,
                                task_type="retrieval_document",
                                title=title)["embedding"]
  
def create_chroma_db(documents, name):
    chroma_client = chromadb.Client()
    db = chroma_client.create_collection(name=name, embedding_function=GeminiEmbeddingFunction())
    for i, d in enumerate(documents):
        db.add(
            documents=d,
            ids=str(i)
        )
    return db

def delete_db():
    store_name = "pdfs_database"
    chroma_client = chromadb.Client()
    chroma_client.delete_collection(name=store_name)
    print("db deleted successfully")

#to get relevant texts for generating QA
def get_relevant_passages(query, db, n_results=1):
    results = db.query(query_texts=[query], n_results=n_results)
    documents = results['documents'][0]  # Extract the documents list
    return documents

def make_prompt(relevant_passage, prompt):
    escaped = relevant_passage.replace("'", "").replace('"', "").replace("\n", " ")
    prompt = ("""You are a helpful and informative bot that generates valid questions and their answers using text from the reference passage included below. \
    Also consider the prompt provided below for generating the result.\
    PROMT:'{prompt}'\
    PASSAGE: '{relevant_passage}'\
    ANSWER: Be sure to generate the answers of all the questions of all the types in the end
    """).format(relevant_passage=escaped, prompt=prompt)

    return prompt

@app.route('/generate_qa', methods=['POST'])
def generate_qa():
    try:
        # Get the list of uploaded PDF files from the request
        pdf_files = request.files.getlist('pdfs')
        query = request.form.get('prompt')
        topic = request.form.get('topic')
        # print(pdf_files)
        # Ensure at least two PDF files are provided
        if len(pdf_files) < 1:
            return jsonify({"error": "Please provide at least 1 PDF file."}), 400

        #combining text from all pdf files
        texts=""
        for pdf_file in pdf_files:
            texts+=extract_text_from_pdf(pdf_file)

        # print(texts)
        documents=get_chunks(texts)

        print("Creating embeddings")
        # Set up the DB
        db = create_chroma_db(documents, "pdfs_database")
        print(f"Collection created successfully.")

        # Perform embedding search
        # topic="clustering in DBMS"
        print("topic:",topic)
        passages = get_relevant_passages(topic, db, n_results=2)
        delete_db()
        # print("rel docs:", passages)
        # print(len(passages))
        combined_passage=""
        for passage in passages:
            # print(passage)
            combined_passage+=passage
        
        # query='Please generate 7 true false questions'
        print("recieved query", query)
        prompt = make_prompt(combined_passage, query)
        # print(prompt)
        
        model = genai.GenerativeModel('gemini-pro')
        print("generating response")
        answer = model.generate_content(prompt)
        print(answer.text)
        html_content = markdown.markdown(answer.text)

        return jsonify({"html_content": html_content, "relevant_passage":combined_passage}), 200

    except Exception as e:
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500


if __name__ == '__main__':
    app.run(debug=True)
