// Update the AWS SDK configuration
AWS.config.update({
  accessKeyId: 'AKIAVMOZM3HQZ7SWYLMU',
  secretAccessKey: '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',
  region: 'us-west-2' // Update with the correct region
});

// Create an S3 instance
const s3 = new AWS.S3();

const params1 = {
  Bucket: 'cart-mobil-test-data-bucket',
  Key: 'Jungle Jungle Baat Chali Hai (Lyrics) -  The Jungle Book.mp4',
  Expires: 100 // The time to expire in seconds
};

const params2 = {
  Bucket: 'cart-mobil-test-data-bucket',
  Key: 'PXL_20230402_060406073.mp4',
  Expires: 100 // The time to expire in seconds
};

// Generate the signed URL for the first video
s3.getSignedUrl('getObject', params1, function (err, url) {
  if (err) {
      console.log('Error getting presigned URL', err);
  } else {
      // Use the URL
      console.log('The URL is', url);

      // Set the video source to the signed URL
      const localVideo = document.getElementById('localView');
      localVideo.src = url;
      localVideo.load();
  }
});

// Generate the signed URL for the second video
s3.getSignedUrl('getObject', params2, function (err, url) {
  if (err) {
      console.log('Error getting presigned URL', err);
  } else {
      // Use the URL
      console.log('The URL is', url);

      // Set the video source to the signed URL
      const remoteVideo = document.getElementById('remoteView');
      remoteVideo.src = url;
      remoteVideo.load();
  }
});
