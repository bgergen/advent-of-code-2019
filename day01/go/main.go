package main

import (
	"fmt"
	"io/ioutil"
	"os"
	"path/filepath"
	"strconv"
	"strings"
)

func main() {
	ex, err := os.Executable()
	if err != nil {
		panic(err)
	}
	exPath := filepath.Dir(ex)
	data, err := ioutil.ReadFile(filepath.Join(exPath, "../input.txt"))
	if err != nil {
		panic(err)
	}

	massList := strings.Split(string(data), "\n")
	totalFuelReq := findTotalFuelReq(massList)
	fmt.Println(totalFuelReq)
}

func calculate(m int) int {
	return m/3 - 2
}

func calculateFuelReq(remaining int) int {
	fuel := calculate(remaining)
	if fuel <= 0 {
		return 0
	} else {
		return fuel + calculateFuelReq(fuel)
	}
}

func findTotalFuelReq(massList []string) int {
	var total int
	for _, m := range massList {
		v, err := strconv.Atoi(m)
		if err != nil {
			panic(err)
		}
		total += calculateFuelReq(v)
	}
	return total
}
