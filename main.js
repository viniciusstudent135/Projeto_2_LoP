async function testarMoveNet() {
  await tf.setBackend('webgl');
  await tf.ready();

  const detector = await poseDetection.createDetector(
    poseDetection.SupportedModels.MoveNet,
    { modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING }
  );

  const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
  const video = document.getElementById('webcam');
  video.srcObject = stream;
  await new Promise(r => video.onloadedmetadata = r);
  await video.play();

  // Teste de detecção — imprime os keypoints no console
  const poses = await detector.estimatePoses(video);
  if (poses.length > 0) {
    console.log('🦴 Keypoints detectados:', poses[0].keypoints);
    const keypoints = poses[0].keypoints;
    alert(poses.length);
  } 
}
testarMoveNet();

