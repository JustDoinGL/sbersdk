.element {
  overflow: auto; /* или scroll */
  -ms-overflow-style: none;  /* IE 10+ */
  scrollbar-width: none;  /* Firefox */
}

.element::-webkit-scrollbar {
  width: 0;
  height: 0;
  background: transparent; /* Chrome, Safari, Edge, Opera */
}