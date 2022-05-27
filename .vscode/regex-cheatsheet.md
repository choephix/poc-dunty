Cleaning up git log for bi-weekly report:


Remove the following
```

(.+)(chore|debug|style):(.+)\n

2021[-\d :]+ [\S]+ - ([\S]+): 
2021.+ Merge .+ from .+\n
2021.+ - CI: .+\n

```
