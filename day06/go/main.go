package main

import (
	"fmt"
	"io/ioutil"
	"strings"
)

const (
	centerOfMass string = "COM"
	santa        string = "SANTA"
	me           string = "YOU"
)

type OrbitMap map[string]string
type TotalOrbitsMap map[string]int

func main() {
	input, err := ioutil.ReadFile("../input.txt")
	if err != nil {
		panic(err)
	}
	var inputData [][]string
	for _, s := range strings.Split(string(input), "\n") {
		inputData = append(inputData, strings.Split(s, ")"))
	}

	directOrbitMap, err := getDirectOrbitMap(inputData)
	if err != nil {
		panic(err)
	}

	// Part 1
	fmt.Println(calcTotalOrbits(directOrbitMap))
}

func getDirectOrbitMap(input [][]string) (OrbitMap, error) {
	orbitMap := make(OrbitMap)
	for _, orbit := range input {
		orbited := orbit[0]
		orbiting := orbit[1]
		if _, ok := orbitMap[orbiting]; ok {
			return nil, fmt.Errorf("Object %s cannt orbit > 1 other object", orbiting)
		} else {
			orbitMap[orbiting] = orbited
		}
	}
	return orbitMap, nil
}

func calcTotalOrbits(om OrbitMap) int {
	var totalOrbits int
	for _, v := range getTotalOrbitsMap(om) {
		totalOrbits += v
	}
	return totalOrbits
}

func getTotalOrbitsMap(om OrbitMap) TotalOrbitsMap {
	tom := make(TotalOrbitsMap)
	for k, _ := range om {
		if _, ok := tom[k]; !ok {
			tom[k] = calcNumOrbits(k, om, tom)
		}
	}
	return tom
}

func calcNumOrbits(orb string, om OrbitMap, tom TotalOrbitsMap) int {
	dirOrb := om[orb]
	if dirOrb == centerOfMass {
		return 1
	} else if _, ok := tom[dirOrb]; !ok {
		tom[dirOrb] = calcNumOrbits(dirOrb, om, tom)
	}
	return tom[dirOrb] + 1
}
