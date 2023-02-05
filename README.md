# earley-intersection

⚠️👷🏻‍♂️ Changes are underway for the 1.0.0 release.


A JavaScript implementation of Earley intersection, based on Doctor Wilker Aziz's notes[1] from the University of Amsterdam.

[1] [Earley intersection](https://uva-slpl.github.io/nlp2/resources/papers/Aziz-Earley.pdf)

## Notes
 - Needs further testing to be ready for prime time.
 - Following the notes, weight calculations aren't included.

## Example
An example is included in `harmonization.js`. It works as follows.

1. Defines a CFG representing a *horizontal* chord progression language.
2. Constructs an FSA representing chord options according to some score's *vertical* note constraints. The example doesn't process an actual symbolic music score, but directly provides the resulting constraints as an FSA for illustration.
3. Earley intersection is applied, and the output is a parse forest (CFG) containing the following productions, where "S" is the start symbol.

```
[
    {
        "lhs": "S",
        "rhs": "Composition_0,4"
    },
    {
        "lhs": "Composition_0,4",
        "rhs": [ "Tonic_0,1", "PhraseMiddle_1,3", "Tonic_3,4" ]
    },
    {
        "lhs": "Tonic_0,1",
        "rhs": [ "C" ]
    },
    {
        "lhs": "Tonic_3,4",
        "rhs": [ "C" ]
    },
    {
        "lhs": "PhraseMiddle_1,3",
        "rhs": [ "SubdominantFunction_1,2", "DominantFunction_2,3" ]
    },
    {
        "lhs": "SubdominantFunction_1,2",
        "rhs": [ "Dm" ]
    },
    {
        "lhs": "SubdominantFunction_1,2",
        "rhs": [ "F" ]
    },
    {
        "lhs": "DominantFunction_2,3",
        "rhs": [ "Bdim" ]
    }
]
```
