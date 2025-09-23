// camera-manager.js - Handles camera operations
class CameraManager {
    static async startCamera() {
        try {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }

            stream = await navigator.mediaDevices.getUserMedia({
                video: { width: 640, height: 480 }
            });

            const video = document.getElementById('videoElement');
            video.srcObject = stream;
            video.style.display = 'block';

            const canvas = document.getElementById('capturedImage');
            canvas.style.display = 'none';

            showToast('Camera started successfully');
        } catch (err) {
            console.error("Error accessing camera:", err);
            showToast("Error accessing camera. Please check permissions.", true);
        }
    }

    static capturePhoto() {
        const video = document.getElementById('videoElement');
        const canvas = document.getElementById('capturedImage');

        if (!video.srcObject) {
            showToast("Please start the camera first", true);
            return;
        }

        const context = canvas.getContext('2d');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        photoData = canvas.toDataURL('image/jpeg', 0.8);
        canvas.style.display = 'block';
        video.style.display = 'none';

        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }

        showToast('Photo captured successfully');
    }

    static retakePhoto() {
        photoData = null;
        document.getElementById('capturedImage').style.display = 'none';
        document.getElementById('videoElement').style.display = 'block';
        CameraManager.startCamera();
    }
}