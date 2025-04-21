
import { ChangeEvent, useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload, X } from "lucide-react";

interface ImageUploadProps {
  onImageUpload: (file: File) => void;
  imagePreview: string | null;
}

const ImageUpload = ({ onImageUpload, imagePreview }: ImageUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);
  
  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);
  
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        onImageUpload(file);
      }
    }
  }, [onImageUpload]);
  
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onImageUpload(e.target.files[0]);
    }
  };
  
  const handleRemoveImage = () => {
    onImageUpload(null as unknown as File);
  };
  
  return (
    <div className="space-y-4">
      {!imagePreview ? (
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center ${
            isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <Upload className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-sm font-medium text-gray-900">
            Drag and drop your image here
          </p>
          <p className="mt-1 text-xs text-gray-500">
            PNG, JPG, JPEG up to 10MB
          </p>
          <input
            id="file-upload"
            type="file"
            className="sr-only"
            accept="image/*"
            onChange={handleFileChange}
          />
          <Button
            variant="secondary"
            className="mt-4"
            onClick={() => document.getElementById("file-upload")?.click()}
          >
            Select File
          </Button>
        </div>
      ) : (
        <div className="relative">
          <img
            src={imagePreview}
            alt="Medical image preview"
            className="w-full h-auto rounded-lg max-h-80 object-contain"
          />
          <Button
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2"
            onClick={handleRemoveImage}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
