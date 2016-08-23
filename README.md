# extract-component package

Refactoring task to extract a portion of JSX as a new component.

# TODO

x Prettier indentation on both removed and inserted text
/ Look for var refs and transform to props
	- done-ish, currently looks only for MemberExpression names
	  would be _better_ if <Image src={images.imageSrc}/> became:
		  <Component src={images.imageSrc}/>

			const Component = ({ src }) => (
  			<Image src={src}/>
		  )

		although this would introduce complexity and probably new edge cases
- grab jsx component imports
- restore focus to active editor on modal close
	- this should be working, not sure why it isn't
- save the new component file immediately?
- add new import last?
- Allow for leaving children in place, only extracting wrapping element as component
- Leave children by default, by UI option, or by separate command?
