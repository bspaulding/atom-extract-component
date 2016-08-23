# extract-component package

Refactoring task to extract a portion of JSX as a new component.

# TODO

- Look for var refs and transform to props. this is done-ish, 
  currently looks only for MemberExpression names
  would be _better_ if `<Image src={images.imageSrc}/>` became:
  ```javascript
	  <Component src={images.imageSrc}/>

	  const Component = ({ src }) => (
 			<Image src={src}/>
	  )
  ```
  although this would introduce complexity and probably new edge cases
- restore focus to active editor on modal close
	- this should be working, not sure why it isn't
- add new import last?
- Allow for leaving children in place, only extracting wrapping element as component
- Leave children by default, by UI option, or by separate command?
