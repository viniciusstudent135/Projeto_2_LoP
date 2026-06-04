// ------------------ THREE.JS ---------------------
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(100, window.innerWidth/window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
camera.position.z = 10;

//--------------------- CONFIGURAÇÃO DE SOMBRAS -----------------------\\
// Ativa sombras no renderer
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

// Luz ambiente — iluminação base para não ficar escuro demais
const luzAmbiente = new THREE.AmbientLight(0xffffff, 0.9);
scene.add(luzAmbiente);

// Luz direcional — simula o sol
const sol = new THREE.DirectionalLight(0xffffff, 1);
sol.position.set(20, 40, 20);
sol.castShadow = true;

// Ajusta a área de sombra (precisa cobrir sua pista)
sol.shadow.camera.left   = -100;
sol.shadow.camera.right  =  100;
sol.shadow.camera.top    =  100;
sol.shadow.camera.bottom = -100;
sol.shadow.mapSize.width  = 2048; // qualidade da sombra
sol.shadow.mapSize.height = 2048;

scene.add(sol);

// ------------------ CARRO ----------------------
const carro = new THREE.Group();
const corCarro = 0xe30f00;

var xBase = 2, yBase = 0.85, zBase = 3;
var xRelevo = 2, yRelevo = 0.8, zRelevo = 1.7;

function CriarCorpo(largura, altura, comprimento, posicao_y, cor) {
  const body = new THREE.Mesh(
    new THREE.BoxGeometry(largura, altura, comprimento),
    new THREE.MeshLambertMaterial({ color: cor })
  );
  body.position.y = posicao_y;
  return body;
}

const base   = CriarCorpo(xBase,   yBase,   zBase,   0,   corCarro);
const relevo = CriarCorpo(xRelevo, yRelevo, zRelevo, 0.5, corCarro);
carro.add(base);
carro.add(relevo);

function criarRodas(posicao_x, posicao_z, raio_e_altura, pontas, cor) {
  const roda = new THREE.Mesh(
    new THREE.CylinderGeometry(raio_e_altura, raio_e_altura, raio_e_altura, pontas),
    new THREE.MeshLambertMaterial({ color: cor })
  );
  roda.rotation.z = Math.PI / 2;
  roda.position.set(posicao_x, -0.6, posicao_z);
  return roda;
}

const xRoda = 0.9, raioRoda = 0.4, pontasRoda = 8, corRoda = 0x000000;
const rodaDireitaTras    = criarRodas( xRoda,  xRoda, raioRoda, pontasRoda, corRoda);
const rodaEsquerdaTras   = criarRodas(-xRoda,  xRoda, raioRoda, pontasRoda, corRoda);
const rodaDireitaFrente  = criarRodas( xRoda, -xRoda, raioRoda, pontasRoda, corRoda);
const rodaEsquerdaFrente = criarRodas(-xRoda, -xRoda, raioRoda, pontasRoda, corRoda);
carro.add(rodaDireitaFrente);
carro.add(rodaEsquerdaTras);
carro.add(rodaDireitaTras);
carro.add(rodaEsquerdaFrente);

// Para as peças projetarem sombra
carro.traverse((obj) => {
  if (obj.isMesh) obj.castShadow = true;
});

// ------------------ PISTA ---------------------- 
const corPista  = 0x394039;
const corChao   = 0x1a6b15;
const corListra = 0xd1c411;
const Pista = new THREE.Group();

function CriarGround(base, altura, cor, posicao_y, posicao_z) {
  const chao = new THREE.Mesh(
    new THREE.PlaneGeometry(base, altura),
    new THREE.MeshLambertMaterial({ color: cor })
  );
  chao.rotation.x = -Math.PI / 2;
  chao.position.y = posicao_y;
  chao.position.z = posicao_z;
  return chao;
}

const Chao = CriarGround(700, 700, corChao, -0.93, 0);
Pista.add(CriarGround(20, 700, corPista, -0.92, 0));
for (let i = -330; i <= 350; i += 30) {
  Pista.add(CriarGround(2, 15, corListra, -0.91, i));
}

Chao.receiveShadow = true;
// -------------------- CERCADO --------------------------

function CriarCercado(base, altura, profundidade, cor, posicao_x, posicao_y, posicao_z) {
  const cercado = new THREE.Mesh(
    new THREE.BoxGeometry(base, altura, profundidade), // largura, altura, profundidade
    new THREE.MeshLambertMaterial({ color: cor })
  );
  cercado.rotation.y = -Math.PI/2;
  cercado.position.y = posicao_y;
  cercado.position.z = posicao_z;
  cercado.position.x = posicao_x;
  return cercado;
}
const Cercado = new THREE.Group();
const corCercado = 0xF0E68C;
const CercadoLateral = CriarCercado(700, 3, 1, corCercado, 10, -0.4, 0);
const CercadoLateral2 = CriarCercado(700, 3, 1, corCercado, -10, -0.4, 0);
Cercado.add(CercadoLateral);
Cercado.add(CercadoLateral2);
Cercado.receiveShadow = true;

const corCerca = 0x8B4513;
// Array com todos os objetos que o carro pode colidir
const obstaculos = [CercadoLateral, CercadoLateral2];

// Adiciona as cercas do cercado também
for (let i = -330; i <= 350; i += 12) {
  const cercaDir = CriarCercado(2, 5, 2, corCerca,  10, 0, i);
  const cercaEsq = CriarCercado(2, 5, 2, corCerca, -10, 0, i);
  Cercado.add(cercaDir);
  Cercado.add(cercaEsq);
  obstaculos.push(cercaDir);
  obstaculos.push(cercaEsq);
}

Cercado.position.set(0, 1, 0);//ajusta a posição do cercado para que fique alinhado com a pista

//--------------------- ADICIONANDO BLOCOS COLETAVEIS -----------------------

function CriarBlocos(base, altura, profundidade, cor, posicao_x, posicao_y, posicao_z) {
  const bloco = new THREE.Mesh(
    new THREE.BoxGeometry(base, altura, profundidade), // largura, altura, profundidade
    new THREE.MeshLambertMaterial({ color: cor })
  );
  bloco.position.y = posicao_y;
  bloco.position.x = posicao_x;
  bloco.position.z = posicao_z;

  bloco.rotation.y += Math.random() * Math.PI; // Rotaciona o bloco aleatoriamente
  return bloco;
}

var Coletaveis = [];

for(let i = -300; i <= 300; i+=30){
  const bloco = CriarBlocos(1, 1, 1, 0xFF4500, 0, 0.3 , i);
  Coletaveis.push(bloco);
  scene.add(bloco);
}

function ColetarBlocos(){
  const caixaCarro = new THREE.Box3().setFromObject(carro);
  for (let i = Coletaveis.length - 1; i >= 0; i--) {
    const caixaBloco = new THREE.Box3().setFromObject(Coletaveis[i]);
    if (caixaCarro.intersectsBox(caixaBloco)) {
      scene.remove(Coletaveis[i]);
      Coletaveis.splice(i, 1);
    }
  }
  function animacaoBlocos() {
    Coletaveis.forEach(bloco => {
      bloco.rotation.y += 0.03; // Rotaciona o bloco em torno do eixo Y
    });
  }
  
  animacaoBlocos();
}

// -------------------- ADICIONANDO A CENA --------------------------
scene.background = new THREE.Color(0x87ceeb);
scene.add(Chao);
scene.add(Pista);
scene.add(Cercado);
scene.add(carro);

// -------------------- TECLADO --------------------------
const keys = {};
window.addEventListener('keydown', (e) => { keys[e.key.toLowerCase()] = true; });
window.addEventListener('keyup',   (e) => { keys[e.key.toLowerCase()] = false; });

// --------------- CÂMERA ACOMPANHA O CARRO ------------------
function updateCamera() {
  camera.position.x = carro.position.x + 1.5;
  camera.position.z = carro.position.z + 7;
  camera.position.y = carro.position.y + 5;
  camera.lookAt(carro.position);
}

// ---------------- MOVIMENTO DO CARRO ----------------------------
var velocidade = 0.45, angulo = 0.03;
// Guarda a posição antes de mover para poder voltar em caso de colisão
var posAnteriorX = 0;
var posAnteriorZ = 0;

function moverCarro() {
  // ---salva ultima posição---
  posAnteriorX = carro.position.x;
  posAnteriorZ = carro.position.z;
  // ---movimento para frente e para trás---
  if (keys['arrowup'] || keys['w'] || keys['pose_w']) {
    carro.position.z -= velocidade * Math.cos(carro.rotation.y);
    carro.position.x -= velocidade * Math.sin(carro.rotation.y);
  }
  if (keys['arrowdown'] || keys['s'] || keys['pose_s']) {
    carro.position.z += velocidade * Math.cos(carro.rotation.y);
    carro.position.x += velocidade * Math.sin(carro.rotation.y);
  }

  // ---movimento para os lados---
  if (keys['arrowleft'] || keys['a'] || keys['pose_a']) {
    if(rodaEsquerdaFrente.rotation.y < Math.PI/6 && rodaDireitaFrente.rotation.y < Math.PI/6){
    rodaEsquerdaFrente.rotation.y += angulo;
    rodaDireitaFrente.rotation.y += angulo;}
    if (keys['arrowup'] || keys['w'] || keys['pose_w'] ||
        keys['arrowdown'] || keys['s'] || keys['pose_s']) {
      carro.rotation.y += angulo;
    }
  }
  if (keys['arrowright'] || keys['d'] || keys['pose_d']) {
    if(rodaEsquerdaFrente.rotation.y > -Math.PI/6 && rodaDireitaFrente.rotation.y > -Math.PI/6){
    rodaEsquerdaFrente.rotation.y -= angulo;
    rodaDireitaFrente.rotation.y -= angulo;}
    if (keys['arrowup'] || keys['w'] || keys['pose_w'] ||
        keys['arrowdown'] || keys['s'] || keys['pose_s']) {
      carro.rotation.y -= angulo;
    }
  }

  // ---volta as rodas para a posição original quando as teclas de direção são soltas---
  if(!keys['pose_d'] && !keys['pose_a'] && !keys['arrowright'] && !keys['d'] && !keys['arrowleft'] && !keys['a']){
    if(rodaEsquerdaFrente.rotation.y > 0){
      rodaEsquerdaFrente.rotation.y -= angulo;
    } else if(rodaEsquerdaFrente.rotation.y < 0){
      rodaEsquerdaFrente.rotation.y += angulo;
    }
    if(rodaDireitaFrente.rotation.y > 0){
      rodaDireitaFrente.rotation.y -= angulo;
    } else if(rodaDireitaFrente.rotation.y < 0){  
      rodaDireitaFrente.rotation.y += angulo;
    }
  }
}

const caixaCarro = new THREE.Box3();

function verificarColisao() {
  // Atualiza a caixa do carro na posição atual
  caixaCarro.setFromObject(carro);

  for (let i = 0; i < obstaculos.length; i++) {
    const caixaObstaculo = new THREE.Box3().setFromObject(obstaculos[i]);

    if (caixaCarro.intersectsBox(caixaObstaculo)) {
      // Volta para a posição antes da colisão
      carro.position.x = posAnteriorX;
      carro.position.z = posAnteriorZ;
      break; // Para de checar assim que encontrar uma colisão
    }
  }
}

// ---------------- MOVENET - VARIÁVEIS ------------------ 
const video  = document.getElementById('webcam');
const canvas = document.getElementById('canvas');
const ctx    = canvas.getContext('2d');

const NOMES = [
  'nariz','olho_esq','olho_dir','orelha_esq','orelha_dir',
  'ombro_esq','ombro_dir','cotovelo_esq','cotovelo_dir',
  'pulso_esq','pulso_dir','quadril_esq','quadril_dir',
  'joelho_esq','joelho_dir','tornozelo_esq','tornozelo_dir'
];

const CONEXOES = [
  [0,1],[0,2],[1,3],[2,4],
  [5,6],[5,7],[7,9],[6,8],[8,10],
  [5,11],[6,12],[11,12],
  [11,13],[13,15],[12,14],[14,16],
];

// ------------------ MOVENET - INTERPRETA POSE -------------------
function interpretarPose(kps) {
  const ombroEsq   = kps[5];
  const ombroDir   = kps[6];
  const pulsoEsq   = kps[9];
  const pulsoDir   = kps[10];
  const nariz      = kps[0];
  const orelha_esq = kps[3];
  const orelha_dir = kps[4];
  keys['pose_w'] = false;
  keys['pose_s'] = false;
  keys['pose_a'] = false;
  keys['pose_d'] = false;

  //movimentando o carro para os lados com base na posição do nariz em relação às orelhas
  if (nariz.score > 0.5 && orelha_dir.score > 0.5 && orelha_esq.score > 0.5) {
    const diferenca1 = orelha_dir.x - nariz.x;
    const diferenca2 = orelha_esq.x - nariz.x;
    console.log(diferenca1, diferenca2);
    if (diferenca1 < -100) keys['pose_a'] = true;
    if (diferenca2 > 100) keys['pose_d'] = true;
  }

  //movimentando o carro para frente e para trás com base na posição dos pulsos em relação aos ombros
  if (pulsoEsq.score > 0.5 && ombroEsq.score > 0.5) {
    if (pulsoEsq.y < ombroEsq.y) keys['pose_w'] = true;
  }

  if (pulsoDir.score > 0.5 && ombroDir.score > 0.5) {
    if (pulsoDir.y < ombroDir.y + 0.05) keys['pose_s'] = true;
  }
}

// ---------------- MOVENET - LOOP -------------------
async function loopMoveNet(detector) {
  const poses = await detector.estimatePoses(video);
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (poses.length > 0) {
    const kps = poses[0].keypoints;
    interpretarPose(kps);

    const escala  = Math.min(canvas.width / video.videoWidth, canvas.height / video.videoHeight);
    const offsetX = (canvas.width  - video.videoWidth  * escala) / 2;
    const offsetY = (canvas.height - video.videoHeight * escala) / 2;

    kps.forEach((kp, i) => {
      if (kp.score > 0.5) {
        const x = canvas.width - (kp.x * escala) - offsetX;
        const y = (kp.y * escala) + offsetY;
        ctx.fillStyle = 'lime';
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'white';
        ctx.font = '12px monospace';
        ctx.fillText(NOMES[i], x + 8, y + 4);
      }
    });

    CONEXOES.forEach(([a, b]) => {
      const pa = kps[a], pb = kps[b];
      if (pa.score > 0.5 && pb.score > 0.5) {
        const escala  = Math.min(canvas.width / video.videoWidth, canvas.height / video.videoHeight);
        const offsetX = (canvas.width  - video.videoWidth  * escala) / 2;
        const offsetY = (canvas.height - video.videoHeight * escala) / 2;
        ctx.strokeStyle = 'cyan';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(canvas.width - (pa.x * escala) - offsetX, (pa.y * escala) + offsetY);
        ctx.lineTo(canvas.width - (pb.x * escala) - offsetX, (pb.y * escala) + offsetY);
        ctx.stroke();
      }
    });
  }

  requestAnimationFrame(() => loopMoveNet(detector));
}

// ---------------- MOVENET - INICIALIZAÇÃO ----------------
async function iniciarMoveNet() {
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

  canvas.width  = 180;
  canvas.height = 120;

  loopMoveNet(detector);
}

// ---------------- INICIA TUDO ----------------
function animacao() {
  requestAnimationFrame(animacao);
  moverCarro();
  ColetarBlocos();
  verificarColisao();
  renderer.render(scene, camera);
  updateCamera();
}

animacao();
iniciarMoveNet();