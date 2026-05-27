async function testarMoveNet() {
  console.log('⏳ Iniciando TensorFlow...');
  await tf.setBackend('webgl');
  await tf.ready();
  console.log('✅ TensorFlow pronto! Backend:', tf.getBackend());

  console.log('⏳ Carregando modelo MoveNet...');
  const detector = await poseDetection.createDetector(
    poseDetection.SupportedModels.MoveNet,
    { modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING }
  );
  console.log('✅ MoveNet carregado!');

  console.log('⏳ Acessando webcam...');
  const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
  const video = document.getElementById('webcam');
  video.srcObject = stream;
  await new Promise(r => video.onloadedmetadata = r);
  await video.play();
  console.log('✅ Webcam ativa!');

  console.log('🎯 Tudo funcionando — MoveNet pronto para integrar!');

  // Teste de detecção — imprime os keypoints no console
  const poses = await detector.estimatePoses(video);
  if (poses.length > 0) {
    console.log('🦴 Keypoints detectados:', poses[0].keypoints);
  }
}

testarMoveNet();