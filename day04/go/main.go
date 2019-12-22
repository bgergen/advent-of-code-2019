package main

import (
	"fmt"
	"strconv"
	"strings"
)

const myRange string = "272091-815432"

func main() {
	var numPasswords int
	minMax := strings.Split(myRange, "-")
	min, err := strconv.Atoi(minMax[0])
	if err != nil {
		panic(err)
	}
	max, err := strconv.Atoi(minMax[1])
	if err != nil {
		panic(err)
	}

	for ; min <= max; min++ {
		if satisfiesConditions(min) {
			numPasswords++
		}
	}
	fmt.Println(numPasswords)
}

func satisfiesConditions(num int) bool {
	var hasRepeatDigit bool
	numStr := strconv.Itoa(num)
	for i := 0; i < len(numStr)-1; i++ {
		currChar := numStr[i]
		if currChar == numStr[i+1] {
			if i >= len(numStr)-2 || numStr[i+2] != currChar {
				hasRepeatDigit = true
			} else {
				for i < len(numStr)-1 && numStr[i+1] == currChar {
					i++
				}
			}
		}
		if i < len(numStr)-1 && currChar > numStr[i+1] {
			return false
		}
	}
	return hasRepeatDigit
}
