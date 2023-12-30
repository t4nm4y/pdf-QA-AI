import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { PulseLoader } from 'react-spinners'
import { saveAs } from 'file-saver';
import html2pdf from 'html2pdf.js';
import '../App.css';

const Main = () => {
  const [files, setFiles] = useState([]);
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false)
  const [prompt, setPrompt] = useState(null);
  const [topic, setTopic] = useState(null);

  const handleDrop = (e) => {
    e.preventDefault();
    const Uploaded_files = e.dataTransfer.files;

    //checking for valid pdf file types only
    const nonPdfFiles = [...Uploaded_files].filter(file => file.type !== 'application/pdf');

    if (nonPdfFiles.length > 0) {
      return toast.error('Please drop PDF files only!')
    }
    setFiles(Uploaded_files);
    // console.log("Uploaded files:", Uploaded_files)
  };
  const handleFileUpload = (Uploaded_files) => {
    //checking for valid pdf file types only
    const nonPdfFiles = [...Uploaded_files].filter(file => file.type !== 'application/pdf');

    if (nonPdfFiles.length > 0) {
      return toast.error('Please drop PDF files only!')
    }
    setFiles(Uploaded_files);
    // console.log("Uploaded files:", Uploaded_files)
  };

  const backendUrl = 'http://localhost:5000';

  const GenerateQA = async () => {
    if (files.length === 0) {
      return toast.error("Please choose a file first!")
    }
    setLoading(true)
    // console.log(files)
    const formData = new FormData();

    [...files].forEach(file => formData.append('pdfs', file))

    console.log('FormData:', [...formData.entries()]);
    formData.append('prompt', prompt);
    formData.append('topic', topic);
    try {
      const response = await fetch(`${backendUrl}/generate_qa`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const responseData = await response.json();
        setResponse(responseData)
        console.log("relevant passage:", responseData.relevant_passage)
        setFiles([])
        // console.log('successful:', responseData);
      } else {
        const responseData = await response.json();
        console.error('Error encountered:', responseData.error);
      }
    } catch (error) {
      toast.error("Error encountered!")
      console.error('Error connecting with the backend api:', error);
    } finally {
      setLoading(false);
    }
  };

  //exporting the QA result
  const exportAsHtml = () => {
    const htmlContent=response.html_content;
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    saveAs(blob, 'QA Test.html');
  };

  const exportAsPdf = () => {
    const htmlContent=response.html_content;
    html2pdf(htmlContent, { margin: 10, filename: 'QA Test.pdf' });
  };

  return (
    <div className='mainWrap'>
      {response ?
        <>
          <div dangerouslySetInnerHTML={{ __html: response.html_content }} />
          <div className="row_apart">
            <button onClick={exportAsHtml}>Export as HTML</button>
            <button onClick={exportAsPdf}>Export as PDF</button>
          </div>

          <button className="important" onClick={() => window.location.reload()}>Reset</button>
        </>
        :
        (
          files.length > 0 ? (
            <>
              <div className="heading">Chosen files:</div>
              <ul>
                {[...files].map((file, index) => (
                  <li key={index}>{file.name}</li>
                ))}
              </ul>
              <br />
              <div className="heading">Please enter the topics, chapters, subjects etc. (present in the pdf) on which you want to generate the QA.<br />eg: "Generative AI"</div>
              <br />
              <input className='promptInput' type='text' placeholder='Enter Topic' onChange={(e) => setTopic(e.target.value)} />
              <br />
              <br />
              <div className="heading">Please enter a prompt specifying the type and no. of questions. <br />eg: "Please generate 7 True-False Questions."</div>
              <br />
              <input className='promptInput' type='text' placeholder='Enter Prompt' onChange={(e) => setPrompt(e.target.value)} />
              <br />
              {prompt && topic && <button onClick={GenerateQA}>Generate QA</button>}
            </>
          ) : (
            <div className='dropArea' onDragOver={(e) => e.preventDefault()} onDrop={(e) => handleDrop(e)}>
              <p>Drag 'n' drop or choose PDF files</p>
              <input className='file_input' type="file" accept=".pdf" multiple onChange={(e) => handleFileUpload(e.target.files)} />
            </div>
          )
        )
      }


      <PulseLoader
        loading={loading}
        color={"#ACBBBF"}
        style={{ margin: '1em' }}
        size={9}
      />

    </div>
  );
};

export default Main;
