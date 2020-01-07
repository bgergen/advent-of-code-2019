package main

import (
	"errors"
	"fmt"
	"io/ioutil"
	"math"
	"strconv"
	"strings"
)

type Opcode int
type ParamMode int

const (
	Add Opcode = iota + 1
	Multiply
	Input
	Output
	JumpTrue
	JumpFalse
	LessThan
	Equals
	End Opcode = 99
)

const (
	Position ParamMode = iota
	Immediate
)

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

	inputDataCopy := make([]int, len(inputData))
	copy(inputDataCopy, inputData)

	n, err := runIntCode(inputDataCopy, 1)
	if err != nil {
		fmt.Println(err)
	}

	tr, err := runIntCode(inputData, 5)
	if err != nil {
		fmt.Println(err)
	}

	// Part 1
	fmt.Println(n)
	// Part 2
	fmt.Println(tr)
}

func runIntCode(input []int, inputInstr int) (int, error) {
	arithmetic := [2]Opcode{Add, Multiply}
	io := [2]Opcode{Input, Output}
	jump := [2]Opcode{JumpTrue, JumpFalse}
	compare := [2]Opcode{LessThan, Equals}

	var i int
	for i < len(input) {
		instr := input[i]
		codes := strconv.Itoa(instr)
		opcode, _ := (strconv.Atoi(codes[int(math.Max(float64(len(codes)-2), 0)):]))
		o := Opcode(opcode)
		paramModes := codes[0:int(math.Max(float64(len(codes)-2), 0))]

		var params []int
		var shouldJump bool
		var numAdvance int
		if contains(arithmetic, o) || contains(compare, o) {
			for j := 1; j < 3; j++ {
				var p int
				pm := safelyGetParamModes(paramModes, j)
				if ParamMode(pm) == Immediate {
					p = input[i+j]
				} else {
					p = input[input[i+j]]
				}
				params = append(params, p)
			}
			params = append(params, input[i+3])
			numAdvance = 4
		} else if contains(io, o) {
			var p int
			pm, _ := strconv.Atoi(paramModes)
			if ParamMode(pm) == Immediate {
				p = input[i+1]
			} else {
				p = input[input[i+1]]
			}
			params = append(params, p)
			numAdvance = 2
		} else if contains(jump, o) {
			for j := 1; j < 3; j++ {
				var p int
				pm := safelyGetParamModes(paramModes, j)
				if ParamMode(pm) == Immediate {
					p = input[i+j]
				} else {
					p = input[input[i+j]]
				}
				params = append(params, p)
			}
			if o == JumpTrue {
				shouldJump = params[0] != 0
			} else {
				shouldJump = params[0] == 0
			}
			if !shouldJump {
				numAdvance = 3
			}
		}

		switch o {
		case Add:
			input[params[2]] = params[0] + params[1]
		case Multiply:
			input[params[2]] = params[0] * params[1]
		case Input:
			input[input[i+1]] = inputInstr
		case Output:
			output := params[0]
			if Opcode(input[i+2]) == End {
				return output, nil
			} else if output != 0 {
				return 0, fmt.Errorf("Received non-zero output of %d", output)
			}
		case JumpTrue, JumpFalse:
			if shouldJump {
				i = params[1]
			}
		case LessThan:
			var newVal int
			if params[0] < params[1] {
				newVal = 1
			} else {
				newVal = 0
			}
			input[params[2]] = newVal
		case Equals:
			var newVal int
			if params[0] == params[1] {
				newVal = 1
			} else {
				newVal = 0
			}
			input[params[2]] = newVal
		default:
			return 0, fmt.Errorf("Something went wrong at opcode %d, index %d", o, i)
		}

		i += numAdvance
	}

	return 0, errors.New("Did not receive end code")
}

func contains(cs [2]Opcode, c Opcode) bool {
	for _, code := range cs {
		if code == c {
			return true
		}
	}
	return false
}

func safelyGetParamModes(pms string, j int) int {
	var pm int
	if len(pms) >= j {
		pm, _ = strconv.Atoi(string(pms[len(pms)-j]))
	} else {
		pm = 0
	}
	return pm
}
