.box {
  width: 100px;
  height: 100px;
  background-color: #3498db;
  position: absolute;
  animation: runAndFlip 4s infinite linear;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
}

@keyframes runAndFlip {
  0% {
    right: 0;
    transform: translateX(100%) rotateY(0deg);
  }
  50% {
    right: 100%;
    transform: translateX(-100%) rotateY(0deg);
  }
  50.1% {
    transform: translateX(-100%) rotateY(180deg);
  }
  100% {
    right: 0;
    transform: translateX(100%) rotateY(180deg);
  }
}