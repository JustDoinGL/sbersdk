.blurred-textarea {
  position: relative;
}

.blurred-textarea textarea {
  mask-image: linear-gradient(
      to bottom,
      transparent 0%,
      transparent 10px,
      black 20px,
      black 100%
    ),
    linear-gradient(
      to right,
      transparent 0%,
      transparent calc(100% - 12px),
      black 20px,
      black 100%
    );
  -webkit-mask-image: linear-gradient(
      to bottom,
      transparent 0%,
      transparent 10px,
      black 20px,
      black 100%
    ),
    linear-gradient(
      to right,
      transparent 0%,
      transparent calc(100% - 12px),
      black 20px,
      black 100%
    );
}
