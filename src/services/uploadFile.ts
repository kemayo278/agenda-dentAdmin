// File upload service using XMLHttpRequest
let baseUrl = process.env.NEXT_PUBLIC_API_URL;
baseUrl = baseUrl + "/files"  // Append the upload endpoint
export const uploadFile = (
    file: File,
    type: string
  ): Promise<{ name: string }> => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const formData = new FormData();
  
      formData.append("file", file);
      formData.append("type", type);
  
    xhr.open("POST", baseUrl as string, true);
  
      xhr.onreadystatechange = () => {
        if (xhr.readyState === XMLHttpRequest.DONE) {
          if (xhr.status === 200) {
            try {
              const response = JSON.parse(xhr.responseText);
              resolve(response.data);
            } catch (e) {
                console.error("Error parsing response:", e);
              reject(new Error("Invalid response from server."));
            }
          } else {
            reject(new Error("File upload failed."));
          }
        }
      };
  
      xhr.send(formData);
    });
  };
  