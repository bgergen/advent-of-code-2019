package main

import (
	"fmt"
	"io/ioutil"
	"strconv"
	"strings"
)

func main() {
	data, err := ioutil.ReadFile("../input.txt")
	if err != nil {
		panic(err)
	}

	massList := strings.Split(string(data), "\n")
	totalFuelReq := findTotalFuelReq(massList)
	fmt.Println(totalFuelReq)
}

func calculate(m int64) int64 {
	return m/3 - 2
}

func calculateFuelReq(remaining int64) int64 {
	fuel := calculate(remaining)
	if fuel <= 0 {
		return 0
	} else {
		return fuel + calculateFuelReq(fuel)
	}
}

func findTotalFuelReq(massList []string) int64 {
	var total int64
	for _, m := range massList {
		v, err := strconv.ParseInt(m, 10, 0)
		if err != nil {
			panic(err)
		}
		total += calculateFuelReq(v)
	}
	return total
}
