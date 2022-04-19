# Coding Standards


### Development Flow

- Each sprint we'll pull the repository tapos dapat each satin may branch
	- sprint3-kristian
	- sprint3-ryo
	- sprint3-uriel
- Leave meaningful and helpful comments for other devs to easily understand your code (lalo na para pag nagreresolve ng merge conflicts)

#### Intentional Code Reviews
- Saka lang mag cocode review once all of your parts are done na for the iteration of this sprint tapos napush mo na sa github
- Once someone pushes their branch sa github for a Pull Request everyone is required to give a comment kahit 'No comment'
- FIFO tayo sa pag code review, so unang magpush ng branch, unang irereview, hence hindi na kailangan isipin merge conflicts

### Work Tree

```
/root
	/build - react build goes here
	/src - all files and resources (images, assets, etc.)
		/contexts (context js files if any)
		/resources (images, assets, etc.)
		/classes (JS classes)
		/styles (Global styling go here)
			global.css (sample)
		/components (React Components)
			/App (component example)
				App.js
				App.css
				/__test__ (all App component test files go here)
					App.test.js (follow this naming convention)

Note: If the file can't be classified with the existing subfolders in /src, put it in src
Example: endpoints.js, firebase.js, config files, etc.
```


### Naming Conventions

#### Test Files
- `App.test.js` follow this component naming convention placed in its respective `__test__` folder indicated above

#### Javascript

- Variable Names (anything not a function) = camelCase
- Constant Immutable Variables = ALLCAPS
	- e.g. `BORDERWIDTH`;
	- e.g. `shitObj = {}` is in camelCase because an object is mutable
- Function Names = camelCase
- Module Names
	- If React Component = PascalCase
	- Else = camelCase

#### CSS / Styling

- If styling rules dynamically adjusts to program state,
	- use styled-components
- If styling rules are constant and doesn't change
	- use stylesheet files
- Class Names and IDs = skewed-case (e.g. red-background)


#### React Standards

- All components must be functional components


# Team Expectations (Retrospection)

### Moving Forward

#### We are responsible for our own learning
- Ask if you need help, but most I believe we can all do and resolve naman with a bit of research and time

#### Communication
- Communicate ahead if may problem, sakit, or hiatus para makapag adjust sa schedule if ever
	- As respect na rin to sa isa't-isa
- Communicate if naguguluhan or may kailangan, we're all in this together para matapos natin 192

#### Merge conflicts
- Upon merge conflict, yung magpupush yung dapat magresolve
	- With resolve defined as making sure the original logic of the code is intact, hence still working
	- Take your time to read and understand the code you'll merge to and ask if may confusing part
	- This is a necessary step and probably something we'll always do in our field of work
- This structure is made para mas flexible tayo kung kailan tayo gagawa nung respective parts natin. Basta make sure lang na followed yung deadlines each parts
- This means <u>it pays to be early para wala kang isesettle na merge conflicts</u> since FIFO tayo sa pag push sa `main` branch


### Overview
- 3 sprints left (3, 4, 5)

### Backlogs
- Make UI more dynamic and interactive (mute button) etc. 
- Test App and open issues on github
- Resolve frontend issues (if any)
- Randomize sprite selection
- Get consistent assets (sprites and maps) and apply to codebase
- WebRTC integration
- Voicechat Implementation
- Mute voice chat implementation
- Proximity voice chat implementation
- Announcement mode voice chat implementation
- Codebase Optimization
- Rigorous Usability Testing
- Demo

### Sprint #3 Delegation

#### Ryosuke Nakano
- Error / Prompt Message System
	- Para modular and loosely coupled yung messaging system
- UI Completion
#### Uriel Negrido
- Clean codebase while keeping functionalities intact
	- Make sure that all conventions are kept and make changes as needed
	- Helps you familiarize with the tech stack
- Implement sprite selection
	- Pag pasok ng lobby random sprite selection nalang from a set of choices
	- This must align with Ryo's animation system
#### Kristian Quirapas
- Backend Completion



### Sprint #4 Delegation

### Kamustahan session muna 

### Main Goal (Complete Application, no more changes on next sprint other than testing ang bug fixes)
- monday to friday (sprint to the max)
- saturday sunday (code review)
- next week mon - wed (code refactor based on code reviews)
- thursday merging
- friday sprint assessment

#### Sprint #4 Personal Goals

#### Ryosuke Nakano
- Do proper form validation (check if email, or password, etc. then add necessary alerts)
- Make UI more dynamic and interactive (mute button) etc. 

- Test App and open issues on github
- Resolve frontend issues (if any)

#### Uriel Negrido
- Make sprite selection randomized
- Get consistent assets (sprites and maps) and apply to codebase

- Test App and open issues on github

#### Kristian Quirapas
- resolve same username for user bug
- Test App and open issues on github
- WebRTC integration
- Voicechat Implementation
- Mute voice chat implementation
- Proximity voice chat implementation
- Announcement mode voice chat implementation


Kristian
-tapusin agad

Ryo
-wala naman

Uri
-di malate / makasabay
