import logo from './logo.svg';
import './App.css';
import { useState } from "react"

// FileDownloadLink component
const FileDownloadLink = ({ filename, data }) => {
  const downloadFile = () => {
    const byteCharacters = atob(data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'application/octet-stream' });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();

    URL.revokeObjectURL(url);
  };

  return (
    <button onClick={downloadFile}>
      Download {filename}
    </button>
  );
};
function App() {
 
 

  
  const [prompt, setPrompt] = useState("");
  const [apiResponse, setApiResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const functionKey = 'Q_N-WBQQcHWXumsiBs2qkEf5egtY5bcDuClGZ5DyeCMdAzFubwQK8w=='; // Replace with your function key
  const functionUrl = 'https://projectorgpt2.azurewebsites.net/api/ask'; // Replace with your Azure Function URL
  let thread_id = "";
  let images = [];
  let files = [];
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(functionUrl, {
        method: 'POST', // or 'GET' or 'PUT', depending on your Azure Function
        headers: {
          'Content-Type': 'application/json',
          'x-functions-key': functionKey,
        },
        // You can include a request body here if your Azure Function expects it
        body: JSON.stringify({ prompt: prompt, thread_id: thread_id}),
      });
      //"{'assistant_response': 'Hello! How can I assist you today?', 'thread_id': 'thread_URjh5ViHK1kTZWR9aUcv94qF', 'images': [], 'files': []}"
      const result = await response.text();
      let result_json = JSON.parse(result);
      thread_id = result_json.thread_id;
      
      result_json.images.forEach(image => {
        images.push({
          filename: image.image_file.file_name,
          data: image.image_file.fyle_bytes
        });
      });
      result_json.files.forEach(file => {
        files.push({
          filename: file.file_path.file_name,
          data: file.file_path.file_bytes,
        });
      });
      setApiResponse(
        {
          "message" : result_json.assistant_response,
          "images" : images,
          "files" : files
        }
        );
    } catch (e) {
      //console.log(e);
      setApiResponse("Something is going wrong, Please try again.");
    }
    setLoading(false);
  };   
  
  return (
<>
{apiResponse && (
        
        <div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignContent: "space-between",
            alignItems: "center",
          }}
        >
          <div class="headerbar">
            <div class="menu-main">
              <div class="logo">ProjectorLync</div>
              <div class="menu-group">
                <div class="menu-item">
                  <div class="menu-item-label">Home</div>
                </div>
                <div class="menu-item">
                  <div class="menu-item-label">About</div>
                </div>
              </div>
            </div>
            <div class="menu-item">
              <div class="menu-item-label">Log Out</div>
            </div>
          </div>
          </div>
          <pre className='response'>
            <strong>API response:</strong>
            {apiResponse.message}
          </pre>
          <div className="image-container">
        {apiResponse.images.map((image, index) => (
          <img key={index} src={image.data} alt={`Image ${image.filename}`} />
        ))}
            <ul>
        {apiResponse.files.map((file, index) => (
          <li key={index}>
            <FileDownloadLink filename={file.filename} data={file.data} />
          </li>
        ))}
      </ul>
      </div>
        </div>
      )}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: '100vh',
        }}
      >
        <div className="text-area">
        <form onSubmit={handleSubmit}>
          <textarea id = "textbox"
            type="text"
            value={prompt}
            placeholder="Please ask to projector"
            onChange={(e) => setPrompt(e.target.value)}
          ></textarea>
          <button className='button'
            disabled={loading || prompt.length === 0}
            type="submit"
          >
            {loading ? "Generating..." : "Generate"}
          </button>
        </form>
      </div>
      </div>
 
    </>
  );
}


export default App;