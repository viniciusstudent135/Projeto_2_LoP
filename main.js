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

carro.position.z = 350;

// ------------------ PISTA ---------------------- 
const corPista  = 0x394039;
const corChao   = 0x1a6b15;
const corListra = 0xd1c411;
const Pista = new THREE.Group();

function CriarGround(base,altura,cor, posicao_x,posicao_y, posicao_z, rotation_x, rotation_z) {
  const chao = new THREE.Mesh(
    new THREE.PlaneGeometry(base, altura),//largura e altura
    new THREE.MeshLambertMaterial({color: cor}) //cor e textura do material (material escolhido = básico, cor sólida)
  );
  chao.rotation.x = rotation_x;// rotaciona o objeto
  chao.rotation.z = rotation_z;
  chao.position.y = posicao_y;
  chao.position.z = posicao_z;//move o objeto na cena em 3d
  chao.position.x = posicao_x;
  return chao;
}

const Chao = CriarGround(1000,1000,corChao, 0, -0.93, 0, -Math.PI/2, 0);//cria um chao de fundo
const PistaInicio = CriarGround(20,700,corPista, 0, -0.92, 0, -Math.PI/2, 0);//adiciona asfalto a pista
const PistaCurva1 = CriarGround(20,240,corPista, 110, -0.92, -360, -Math.PI/2, Math.PI/2);//adiciona asfalto lateral a pista
const PistaVolta = CriarGround(20,700,corPista, 220, -0.92, 0, -Math.PI/2, 0);//adiciona asfalto lateral a pista
const PistaCurva2 = CriarGround(20,240,corPista, 110, -0.92, 360, -Math.PI/2, Math.PI/2);//adiciona asfalto lateral a pista
Pista.add(PistaInicio);
Pista.add(PistaCurva1);
Pista.add(PistaVolta);
Pista.add(PistaCurva2);

for(let i = -330; i <= 350; i+=30){
  Pista.add(CriarGround(2,15,corListra, 0,-0.91, i, -Math.PI/2, 0));//adiciona listras a pista
  Pista.add(CriarGround(2,15,corListra, 220,-0.91, i, -Math.PI/2, 0));
}
for(let i = -75; i <= 125; i+=30){
  Pista.add(CriarGround(2,15,corListra, i + 90,-0.91, -360, -Math.PI/2, Math.PI/2));
  Pista.add(CriarGround(2,15,corListra, i + 90,-0.91, 360, -Math.PI/2, Math.PI/2));
}

Chao.receiveShadow = true;
// -------------------- CERCADO --------------------------

function CriarCercado(largura, altura, profundidade, cor, posicao_x, posicao_y, posicao_z) {
  const cercado = new THREE.Mesh(
    new THREE.BoxGeometry(largura, altura, profundidade), // largura, altura, profundidade
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
const CercadoVerticalDir = CriarCercado(700, 3, 1, corCercado, 10, -0.4, 0, -Math.PI/2);
const CercadoVerticalEsq = CriarCercado(741, 3, 1, corCercado, -10, -0.4, 0, -Math.PI/2);
const CercadoHorizontalDir = CriarCercado(200, 3, 1, corCercado, 109.5, -0.4, -350, 0);
const CercadoHorizontalEsq = CriarCercado(240, 3, 1, corCercado, 110, -0.4, -370, 0);
const CercadoVerticalDir2 = CriarCercado(741, 3, 1, corCercado, 230, -0.4, 0, -Math.PI/2);
const CercadoVerticalEsq2 = CriarCercado(701, 3, 1, corCercado, 210, -0.4, 0, -Math.PI/2);
const CercadoHorizontalDir2 = CriarCercado(240, 3, 1, corCercado, 110, -0.4, 370, 0);
const CercadoHorizontalEsq2 = CriarCercado(200, 3, 1, corCercado, 109.5, -0.4, 350, 0);
Cercado.add(CercadoVerticalEsq);
Cercado.add(CercadoVerticalDir);
Cercado.add(CercadoHorizontalDir);
Cercado.add(CercadoHorizontalEsq);
Cercado.add(CercadoVerticalDir2);
Cercado.add(CercadoVerticalEsq2);
Cercado.add(CercadoHorizontalDir2);
Cercado.add(CercadoHorizontalEsq2);
Cercado.receiveShadow = true;

// Array com todos os objetos que o carro pode colidir
const obstaculos = [
    CercadoVerticalEsq, CercadoVerticalDir, 
    CercadoHorizontalDir, CercadoHorizontalEsq, 
    CercadoVerticalDir2, CercadoVerticalEsq2, 
    CercadoHorizontalDir2, CercadoHorizontalEsq2];

// Adiciona as cercas do cercado também
const corCerca = 0x8B4513;
for (let i = -335; i <= 355; i += 12) {
  const cercaVerticalDir = CriarCercado(2, 5, 2, corCerca,  10, 0, i, 0);
  const cercaVerticalEsq = CriarCercado(2, 5, 2, corCerca, -10, 0, i, 0);
  const cercaVerticalDir2 = CriarCercado(2, 5, 2, corCerca,  230, 0, i, 0);
  const cercaVerticalEsq2 = CriarCercado(2, 5, 2, corCerca, 210, 0, i, 0);  
  Cercado.add(cercaVerticalDir);
  Cercado.add(cercaVerticalEsq);
  Cercado.add(cercaVerticalDir2);
  Cercado.add(cercaVerticalEsq2);
  
  obstaculos.push(cercaVerticalDir);
  obstaculos.push(cercaVerticalEsq);
  obstaculos.push(cercaVerticalDir2);
  obstaculos.push(cercaVerticalEsq2); 
}
for (let i = -75; i <= 125; i += 12) {
  const cercaHorizontalDir = CriarCercado(2, 5, 2, corCerca, i + 90, 0, -350, -Math.PI/2);
  const cercaHorizontalEsq = CriarCercado(2, 5, 2, corCerca, i + 90, 0, -370, -Math.PI/2);
  const cercaHorizontalDir2 = CriarCercado(2, 5, 2, corCerca, i + 90, 0, 350, -Math.PI/2);
  const cercaHorizontalEsq2 = CriarCercado(2, 5, 2, corCerca, i + 90, 0, 370, -Math.PI/2);
  Cercado.add(cercaHorizontalDir);
  Cercado.add(cercaHorizontalEsq);
  Cercado.add(cercaHorizontalDir2);
  Cercado.add(cercaHorizontalEsq2);

  obstaculos.push(cercaHorizontalDir);
  obstaculos.push(cercaHorizontalEsq);
  obstaculos.push(cercaHorizontalDir2);
  obstaculos.push(cercaHorizontalEsq2);
}
Cercado.position.set(0, 1, 0);//ajusta a posição do cercado para ficar na altura certa

//--------------------- ADICIONANDO BLOCOS COLETAVEIS -----------------------

function CriarBlocos(largura, altura, profundidade, cor, posicao_x, posicao_y, posicao_z) {
  const bloco = new THREE.Mesh(
    new THREE.BoxGeometry(largura, altura, profundidade), // largura, altura, profundidade
    new THREE.MeshLambertMaterial({ color: cor })
  );
  bloco.position.y = posicao_y;
  bloco.position.x = posicao_x;
  bloco.position.z = posicao_z;

  return bloco;
}

var Coletaveis = [];
var Coletados = 0;

for(let i = -300; i <= 300; i+=30){
  const blocoPistaEsq = CriarBlocos(1, 1, 1, 0xFF4500, 0, 0.3 , i);
  const blocoPistaDir = CriarBlocos(1, 1, 1, 0xFF4500, 220, 0.3 , i);
  Coletaveis.push(blocoPistaEsq);
  Coletaveis.push(blocoPistaDir);
  scene.add(blocoPistaEsq);
  scene.add(blocoPistaDir);
}
for(let i = -75; i <= 125; i+=30){
  const blocoPistaFrontal = CriarBlocos(1, 1, 1, 0xFF4500, i + 90, 0.3 , -360);
  const blocoPistaTraseiro = CriarBlocos(1, 1, 1, 0xFF4500, i + 90, 0.3 , 360);
  Coletaveis.push(blocoPistaFrontal);
  Coletaveis.push(blocoPistaTraseiro);
  scene.add(blocoPistaFrontal);
  scene.add(blocoPistaTraseiro);
}

function ColetarBlocos(){
  const caixaCarro = new THREE.Box3().setFromObject(carro);
  for (let i = Coletaveis.length - 1; i >= 0; i--) {
    const caixaBloco = new THREE.Box3().setFromObject(Coletaveis[i]);
    if (caixaCarro.intersectsBox(caixaBloco)) {
      scene.remove(Coletaveis[i]);
      Coletaveis.splice(i, 1);
      Coletados++;
      document.getElementById('score').textContent = `Cubinhos: ${Coletados}/${Coletaveis.length+Coletados}`;
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