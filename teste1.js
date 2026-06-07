const video = document.getElementById('webcam');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// Nomes dos 17 pontos — use para identificar cada índice
const NOMES = [
  'nariz',           // 0
  'olho_esq',        // 1
  'olho_dir',        // 2
  'orelha_esq',      // 3
  'orelha_dir',      // 4
  'ombro_esq',       // 5
  'ombro_dir',       // 6
  'cotovelo_esq',    // 7
  'cotovelo_dir',    // 8
  'pulso_esq',       // 9
  'pulso_dir',       // 10
  'quadril_esq',     // 11
  'quadril_dir',     // 12
  'joelho_esq',      // 13
  'joelho_dir',      // 14
  'tornozelo_esq',   // 15
  'tornozelo_dir'    // 16
];

const CONEXOES = [
  [0, 1], [0, 2],           // nariz → olhos
  [1, 3], [2, 4],           // olhos → orelhas
  [5, 6],                   // ombro → ombro
  [5, 7], [7, 9],           // braço esquerdo
  [6, 8], [8, 10],          // braço direito
  [5, 11], [6, 12],         // tronco
  [11, 12],                 // quadril
  [11, 13], [13, 15],       // perna esquerda
  [12, 14], [14, 16],       // perna direita
];

async function main() {
  await tf.setBackend('webgl');
  await tf.ready();

  const detector = await poseDetection.createDetector(
    poseDetection.SupportedModels.MoveNet,
    { modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING }
  );

  const stream = await navigator.mediaDevices.getUserMedia({ video: true });
  video.srcObject = stream;
  await new Promise(r => video.onloadedmetadata = r);
  await video.play();

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  loop(detector);
}

async function loop(detector) {
  const poses = await detector.estimatePoses(video);
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (poses.length > 0) {
    const kps = poses[0].keypoints;

    // ─── DESENHA OS PONTOS ───────────────────────
    // Fator de escala entre o vídeo real e a tela
    const escalaX = (canvas.width) / (video.videoWidth);
    const escalaY = (canvas.height) / (video.videoHeight);

    kps.forEach((kp, i) => {
        if (kp.score > 0.5) {
    // Multiplica as coordenadas pelo fator de escala
            const x = canvas.width - (kp.x * escalaX);
            const y = kp.y * escalaY;

            ctx.fillStyle = 'lime';
            ctx.beginPath();
            ctx.arc(x, y, 6, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = 'white';
            ctx.font = '12px monospace';
            ctx.fillText(NOMES[i], x + 8, y + 4);
        }
    });

// Mesma coisa nas conexões
    CONEXOES.forEach(([a, b]) => {
        const pa = kps[a];
        const pb = kps[b];

        if (pa.score > 0.5 && pb.score > 0.5) {
            ctx.strokeStyle = 'lime';
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.moveTo(canvas.width - (pa.x * escalaX), pa.y * escalaY);
            ctx.lineTo(canvas.width - (pb.x * escalaX), pb.y * escalaY);
            ctx.stroke();
        }
    });

  }
  requestAnimationFrame(() => loop(detector));
}

main();