# Clean Code - Comments Rules

## Core Principles

### Basic Philosophy of Comments

- **Good code tells a story by itself** - Clear code needs few comments
- **The only truly good comment is the comment you found a way not to write**
- **Don't comment bad code - rewrite it**

## Good Comments

### 1. Legal Comments

- Copyright and authorship information
- Refer to standard licenses or external documents rather than including full terms

### 2. Informative Comments

- Provide basic information about function input formats
- Explain the intent of regular expression patterns

### 3. Explanation of Intent

- Explain the reasoning behind a decision
- Clarify why a particular choice was made

### 4. Clarification

- Translate complex code into something readable
- Note: Making the code itself clear is preferable

### 5. Warning of Consequences

- Warn other programmers about certain consequences or side effects
- Communicate important precautions

### 6. TODO Comments

- Mark work that should be done but can't be done right now
- Use `//TODO` format to convey messages about future functionality

### 7. Amplification

- Emphasize the importance of something that might otherwise seem inconsequential

## Bad Comments

### 1. Mumbling

- Unclear and obscure comments
- Comments that force you to look in other modules for meaning

### 2. Redundant Comments

- Comments that take longer to read than the code itself
- Comments that repeat what the code already says

### 3. Misleading Comments

- Comments that don't match the actual code behavior
- Comments not updated when code changes

### 4. Mandated Comments

- Rules requiring javadocs for every function or comments for every variable
- Create clutter and general confusion

### 5. Journal Comments

- Recording change history in comments
- Unnecessary with modern version control systems

### 6. Attributions and Bylines

- Author attribution like `/* Added by Rick */`
- Version control systems handle this information

### 7. Commented-Out Code

- Prevents others from having courage to delete it
- Version control systems remember code - just delete it

### 8. Noise Comments

- Comments that do nothing and provide no new information
- Meaningless javadocs that are purely redundant

### 9. Position Markers

- Dividers like `// Actions //////////////////////////////////`
- Use very sparingly, only when benefit is significant

### 10. Closing Brace Comments

- Comments marking the end of long functions
- Better solution: shorten your functions

### 11. Nonlocal Information

- System-wide information in local comment context
- Comments should describe only nearby code

### 12. Too Much Information

- Historical discussions or irrelevant details
- Copying entire RFC specifications

### 13. Inobvious Connection

- Unclear connection between comment and code
- Reader should understand what the comment is about

### 14. Function Headers

- Short functions don't need much description
- Well-chosen function names are better than comment headers

### 15. Javadocs in Nonpublic Code

- Generating javadocs for internal system classes
- Generally not useful and creates distraction

## Implementation Guidelines

### Use Functions or Variables Instead of Comments

Express intent through functions or variables instead of comments:

**Bad Example:**

```js
// Check to see if the employee is eligible for full benefits
if ((employee.flags & HOURLY_FLAG) && (employee.age > 65))
```

**Good Example:**

```js
if (employee.isEligibleForFullBenefits())
```

### Explain Yourself in Code

Instead of explaining with comments, make the code self-explanatory. When you feel the need to write a comment, consider whether you can create a function that says the same thing as the comment you want to write.

### Key Takeaway

Clear code with few comments is far superior to cluttered and complex code with lots of comments. Focus on making your code readable and self-documenting rather than relying on comments to explain poor code.
