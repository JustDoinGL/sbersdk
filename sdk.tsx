function isReactElementWithProps(item: React.ReactNode): item is React.ReactElement<{ lsVisible?: boolean }> {
  return React.isValidElement(item);
}

const style = isReactElementWithProps(item) 
  ? (item.props.lsVisible ? 'visible' : 'inherit')
  : 'inherit';