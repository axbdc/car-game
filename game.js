// Variáveis de estado para controlar os botões
let isAccelerating = false;
let isBraking = false;
let isTurningLeft = false;
let isTurningRight = false;

// Função chamada pelos eventos onmousedown/ontouchstart no HTML
function accelerate(isPressed) {
    isAccelerating = isPressed;
}

function brake(isPressed) {
    isBraking = isPressed;
}

function turn(direction, isPressed) {
    if (direction === 'left') {
        isTurningLeft = isPressed;
        isTurningRight = false; 
    } else if (direction === 'right') {
        isTurningRight = isPressed;
        isTurningLeft = false; 
    }
}

// Componente A-Frame para a lógica de condução
AFRAME.registerComponent('drive-car', {
    schema: {
        // Velocidade máxima de avanço (AUMENTADA)
        maxSpeed: { type: 'number', default: 1.5 },
        // Taxa de aceleração (AUMENTADA)
        acceleration: { type: 'number', default: 0.015 },
        // Taxa de travagem/marcha-atrás
        brakingRate: { type: 'number', default: 0.02 },
        // Velocidade angular de viragem (graus/segundo)
        turnSpeed: { type: 'number', default: 2.0 }
    },

    init: function () {
        this.speed = 0; // Velocidade atual do carro
        this.velocity = new THREE.Vector3();
    },

    tick: function (time, timeDelta) {
        const data = this.data;
        const el = this.el;
        const delta = timeDelta / 1000; // Delta em segundos

        // --- 1. Lógica de Aceleração e Travagem ---
        if (isAccelerating) {
            this.speed = Math.min(this.speed + data.acceleration, data.maxSpeed);
        } else if (isBraking) {
            if (this.speed > 0) {
                this.speed = Math.max(0, this.speed - data.brakingRate);
            } else {
                this.speed = Math.max(-data.maxSpeed / 2, this.speed - data.acceleration / 2);
            }
        } else {
            this.speed *= 0.98; 
        }

        // --- 2. Lógica de Viragem ---
        let currentRotation = el.getAttribute('rotation');
        let rotationChange = 0;

        if (isTurningLeft) {
            rotationChange += data.turnSpeed * delta;
        }
        if (isTurningRight) {
            rotationChange -= data.turnSpeed * delta;
        }
        
        if (Math.abs(this.speed) > 0.005) {
            const turnFactor = (this.speed > 0) ? 1 : 0.5; 
            currentRotation.y += rotationChange * turnFactor;
            el.setAttribute('rotation', currentRotation);
        }

        // --- 3. Atualizar Posição ---
        if (Math.abs(this.speed) > 0.005) {
            const forwardVector = new THREE.Vector3(0, 0, -1).applyQuaternion(el.object3D.quaternion);
            const displacement = forwardVector.multiplyScalar(this.speed * delta);

            let currentPosition = el.getAttribute('position');
            currentPosition.x += displacement.x;
            currentPosition.y += displacement.y;
            currentPosition.z += displacement.z;
            el.setAttribute('position', currentPosition);
        }
    }
});
