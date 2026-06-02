//import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
//configurando cena
const scene = new THREE.Scene();
//camera
const camera = new THREE.PerspectiveCamera(100, window.innerWidth/window.innerHeight, 0.1, 1000);
//renderizador
const renderer = new THREE.WebGLRenderer();
//tamanho da tela
renderer.setSize(window.innerWidth, window.innerHeight);
//linkando o renderizador
document.body.appendChild(renderer.domElement);

//configurar a profundidade da camera:
camera.position.z = 10;

//---------------------|criação do carro|-----------------------\\
const carro = new THREE.Group();
const corCarro = 0xe30f00; // cinza quase brancod3d3d3
//corpo do carro
var xBase = 2, yBase = 0.85, zBase = 3;
var xRelevo = 2, yRelevo = 0.8, zRelevo = 1.7;
function CriarCorpo(largura,altura,comprimento,posicao_y, cor){
  const body = new THREE.Mesh(
    new THREE.BoxGeometry(largura, altura, comprimento),//largura,altura,comprimento
    new THREE.MeshBasicMaterial({color: cor}) //cor e textura do material (material escolhido = básico, cor sólida)
  );
  body.position.y = posicao_y; //move o objeto na cena em 3d
  return body;
}
const base = CriarCorpo(xBase, yBase, zBase, 0, corCarro);
const relevo = CriarCorpo(xRelevo, yRelevo, zRelevo, 0.5, corCarro);
carro.add(base);
carro.add(relevo);

//sombras do carro
function CriaSombra(base, altura,x,y,z){
  const sombra = new THREE.Mesh(
    new THREE.PlaneGeometry(base,altura),
    new THREE.MeshBasicMaterial({color: 0x4f221f})//antes 808080
  );
  sombra.position.set(x,y,z);
  return sombra;
}
var z_cima = 0.855,z_baixo=1.54; //posições das sombras
const sombraRelevo = CriaSombra(xRelevo,yRelevo, 0,0.5,z_cima);
const sombraBase = CriaSombra(xBase,yBase, 0,0,z_baixo);
carro.add(sombraRelevo);
carro.add(sombraBase);

//rodas
function criarRodas(posicao_x,posicao_z, raio_e_altura,pontas, cor){
  const roda = new THREE.Mesh(
    new THREE.CylinderGeometry(raio_e_altura, raio_e_altura, raio_e_altura, pontas),//a = raio das bases do cilindro(2 primeiras letras),altura, b = seg.radiais(quantidade de pontas que forma)
    new THREE.MeshBasicMaterial({ color: cor })
  );
  roda.rotation.z = Math.PI/2;// rotaciona o objeto em 90 graus no eixo z
  roda.position.set(posicao_x, -0.6,posicao_z);
  return roda;
}
const xRoda = 0.9, xAro = 0.97, raioRoda=0.4, raioAro= 0.3, pontasRoda=8, pontasAro=6, corRoda = 0x000000, corAro= 0x808080;
const rodaDireitaTras = criarRodas(xRoda,xRoda, raioRoda,pontasRoda,corRoda);
const rodaEsquerdaTras = criarRodas(-xRoda,xRoda, raioRoda,pontasRoda,corRoda);
const rodaDireitaFrente = criarRodas(xRoda,-xRoda, raioRoda,pontasRoda,corRoda);
const rodaEsquerdaFrente = criarRodas(-xRoda,-xRoda, raioRoda,pontasRoda,corRoda);
carro.add(rodaDireitaFrente);
carro.add(rodaEsquerdaTras);
carro.add(rodaDireitaTras);
carro.add(rodaEsquerdaFrente);
/*/efeito do aro da roda
carro.add(criarRodas(xAro,xRoda,raioAro,pontasAro,corAro));
carro.add(criarRodas(-xAro,xRoda,raioAro,pontasAro,corAro));
carro.add(criarRodas(xAro,-xRoda,raioAro,pontasAro,corAro));
carro.add(criarRodas(-xAro,-xRoda,raioAro,pontasAro,corAro));
*///---------------------|carro pronto|-----------------------\\

//---------------------|criação da pista|-----------------------\\
const corPista = 0x394039;//cor da pista: cinza escuro
const corChao = 0x1a6b15;//cor do chão: verde escuro
const corListra = 0xd1c411;//cor da listra: amarela

const Pista = new THREE.Group();
function CriarGround(base,altura,cor, posicao_y, posicao_z){
  const chao = new THREE.Mesh(
    new THREE.PlaneGeometry(base, altura),//largura e altura
    new THREE.MeshBasicMaterial({color: cor}) //cor e textura do material (material escolhido = básico, cor sólida)
  );
  chao.rotation.x = -Math.PI/2;// rotaciona o objeto
  chao.position.y = posicao_y;
  chao.position.z = posicao_z;//move o objeto na cena em 3d
  return chao;
}

const Chao = CriarGround(700,700,corChao, -0.93, 0);//cria um chao de fundo
Pista.add(CriarGround(20,700,corPista, -0.92, 0));//adiciona asfalto a pista
for(var i = -330; i <= 350; i+=30){
  Pista.add(CriarGround(2,15,corListra, -0.91, i));//adiciona listras a pista
}
//---------------------|pista pronta|-----------------------\\

//---------------------|Criação do Cercado|-----------------------\\
const Cercado = new THREE.Group();
Cercado.add(CriarGround(700, 2, 0x000000, -0.91, -350));
Cercado.add(CriarGround(700, 2, 0x000000, -0.91, 350));
Cercado.add(CriarGround(2, 700, 0x000000, -0.91, 0).rotation.y = Math.PI/2);
//---------------------|cercado pronto|-----------------------\\


scene.background = new THREE.Color(0x87ceeb);//cor do fundo (céu azul claro)
scene.add(Chao);//adiciona o chão a cena
scene.add(Pista);//adiciona a pista a cena
scene.add(Cercado);
scene.add(carro);//adiciona carro a cena

//reconhece o teclado:
const keys = {};
window.addEventListener('keydown', (e) => {
  keys[e.key.toLowerCase()] = true;
});
window.addEventListener('keyup', (e) => {
  keys[e.key.toLowerCase()] = false;
});

//carro se movendo ao apertar as teclas:
function updateCamera() {
  camera.position.x = carro.position.x + 1.5;
  camera.position.z = carro.position.z + 7;
  camera.position.y = carro.position.y + 5;
  camera.lookAt(carro.position); //camera acompanha o carro
}

var velocidade = 0.45, angulo = 0.03;

function moverCarro(){
  if (keys['arrowup'] || keys['w']){
    carro.position.z -= velocidade*Math.cos(carro.rotation.y);
    carro.position.x -= velocidade*Math.sin(carro.rotation.y);
  } 
  if (keys['arrowdown'] || keys['s']){ 
    carro.position.z += velocidade*Math.cos(carro.rotation.y);
    carro.position.x += velocidade*Math.sin(carro.rotation.y); 
  }
  if (keys['arrowleft'] || keys['a']){ 
    if(rodaEsquerdaFrente.rotation.y < Math.PI/6 && rodaDireitaFrente.rotation.y < Math.PI/6){
    rodaEsquerdaFrente.rotation.y += angulo;
    rodaDireitaFrente.rotation.y += angulo;}
    if(keys['arrowup'] || keys['w'] || keys['arrowdown'] || keys['s']){
        carro.rotation.y += angulo;
    }
  }
  if (keys['arrowright'] || keys['d']){ 
    if(rodaEsquerdaFrente.rotation.y > -Math.PI/6 && rodaDireitaFrente.rotation.y > -Math.PI/6){
    rodaEsquerdaFrente.rotation.y -= angulo;
    rodaDireitaFrente.rotation.y -= angulo;}
    if(keys['arrowup'] || keys['w'] || keys['arrowdown'] || keys['s']){
        carro.rotation.y -= angulo;
    }
  }

  if(!keys['d'] && !keys['a']){
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

function animacao(){
  requestAnimationFrame(animacao);
  moverCarro();
  renderer.render(scene, camera);
  updateCamera();
}

animacao();