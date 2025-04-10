import React, { useState } from 'react';
import axios from 'axios';
// import '../css/generate-image-url-dark.css'; // Import dark theme CSS
import "../css/generate-image-url.css"
import { useNavigate } from 'react-router-dom';
import { generateImageUrl } from '../util-api/api';

const GenerateImageUrl = () => {
    const [selectedImage, setSelectedImage] = useState(null);
    const [imageUrl, setImageUrl] = useState('');
    const [uploading, setUploading] = useState(false);
    const [copySuccess, setCopySuccess] = useState('');
    const navigate = useNavigate()

    const handleImageChange = (event) => {
        setSelectedImage(event.target.files[0]);
        setImageUrl('');
        setCopySuccess('');
    };

    const handleUpload = async () => {
        if (!selectedImage) {
            alert('Please select an image to upload.');
            return;
        }
    
        setUploading(true);
    
        try {
            const response = await generateImageUrl(selectedImage);

            console.log("Upload Image Response", response)
    
            if (response?.url) { // Axios uses 'status' for the HTTP status code
                setImageUrl(response.url); // Axios puts the response data in 'response.data'
                setCopySuccess('');
            } else if (response?.status == 401) {
                navigate('/login')
            } else {
                console.error('Image upload failed:', response.statusText || response.status);
                alert('Image upload failed. Please try again.');
            }
        } catch (error) {
            console.error('Error uploading image:', error);
            alert('Error uploading image. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    const copyToClipboard = () => {
        if (imageUrl) {
            navigator.clipboard.writeText(imageUrl)
                .then(() => {
                    setCopySuccess('URL copied!');
                    setTimeout(() => setCopySuccess(''), 2000);
                })
                .catch((err) => {
                    console.error('Failed to copy text: ', err);
                    setCopySuccess('Failed to copy.');
                });
        } else {
            alert('No image URL to copy.');
        }
    };

    return (
        <div className="image-url-generator-dark"> {/* Use the dark theme class */}
            <h2>Generate Image URL</h2>
            <div className="upload-section">
                <label htmlFor="image-upload" className="upload-button">
                    {selectedImage ? selectedImage.name : 'Choose an Image'}
                </label>
                <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                />
                <button onClick={handleUpload} disabled={!selectedImage || uploading}>
                    {uploading ? 'Uploading...' : 'Upload'}
                </button>
            </div>

            {imageUrl && (
                <div className="result-section">
                    <h3>Generated Image URL:</h3>
                    <div className="image-preview">
                        <img src={imageUrl} alt="Uploaded Image" />
                    </div>
                    <div className="url-display">
                        <input type="text" value={imageUrl} readOnly />
                        <button onClick={copyToClipboard} disabled={!imageUrl}>
                            Copy URL
                        </button>
                    </div>
                    {copySuccess && <p className="copy-message">{copySuccess}</p>}
                </div>
            )}
        </div>
    );
};

export default GenerateImageUrl;