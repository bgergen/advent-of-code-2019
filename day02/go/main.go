package main

import (
	"errors"
	"fmt"
	"io/ioutil"
	"strconv"
	"strings"
)

type opcodes struct {
	add      int
	multiply int
	end      int
}

type params struct {
	noun int
	verb int
}

const limit int = 99

func main() {
	input, err := ioutil.ReadFile("../input.txt")
	if err != nil {
		panic(err)
	}
	var inputData []int
	for _, s := range strings.Split(string(input), ",") {
		v, _ := strconv.Atoi(s)
		inputData = append(inputData, v)
	}

	output, err := ioutil.ReadFile("../output.txt")
	if err != nil {
		panic(err)
	}
	outputData, _ := strconv.Atoi(string(output))

	inputDataCopy := make([]int, len(inputData))
	copy(inputDataCopy, inputData)

	n, err := runIntcode(restoreState(inputDataCopy))
	if err != nil {
		fmt.Println(err)
	}

	nv, err := findNounAndVerb(inputData, outputData)
	if err != nil {
		fmt.Println(err)
	}

	// Part 1
	fmt.Println(n)

	// Part 2
	fmt.Println(nv)
	fmt.Println(100*nv.noun + nv.verb)
}

func findNounAndVerb(i []int, o int) (params, error) {
	nounAndVerb := params{}
	for noun := 0; noun <= limit; noun++ {
		for verb := 0; verb <= limit; verb++ {
			inputCopy := make([]int, len(i))
			copy(inputCopy, i)
			program := getState(inputCopy, noun, verb)
			output, err := runIntcode(program)
			if err != nil {
				return nounAndVerb, err
			} else if output == o {
				nounAndVerb.noun = noun
				nounAndVerb.verb = verb
				return nounAndVerb, nil
			}
		}
	}
	return nounAndVerb, errors.New("No noun + verb combination could be found")
}

func runIntcode(program []int) (int, error) {
	opcodeValues := opcodes{
		add:      1,
		multiply: 2,
		end:      99,
	}

	for i := 0; i < len(program); i += 4 {
		operands := [2]int{program[program[i+1]], program[program[i+2]]}
		targetIdx := program[i+3]
		switch program[i] {
		case opcodeValues.add:
			program[targetIdx] = operands[0] + operands[1]
		case opcodeValues.multiply:
			program[targetIdx] = operands[0] * operands[1]
		case opcodeValues.end:
			return program[0], nil
		default:
			return 0, errors.New("Something went wrong")
		}
	}
	return 0, errors.New("Did not receive end code")
}

func getState(input []int, noun int, verb int) []int {
	input[1] = noun
	input[2] = verb
	return input
}

func restoreState(input []int) []int {
	return getState(input, 12, 2)
}
