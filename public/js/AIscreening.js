
const educationRanks = {
    'High School': 1,
    'Diploma': 2,
    "Bachelor's": 3,
    "Master's": 4,
    'PhD': 5
};


function AIscreening(candidate, jobRequirements) {
    // Check if candidate's major exactly matches the required major
    const majorMatches = candidate.major.toLowerCase() === jobRequirements.majorEqv.toLowerCase();

    if (majorMatches) {
        return {
            status: "pass",
            score: 100,
            details: {
                educationScore: 33.33,
                experienceScore: 33.33,
                skillsScore: 33.34
            }
        };
    } else {
        return {
            status: "fail",
            score: 0,
            reason: `This position requires a ${jobRequirements.majorEqv} major`,
            details: {
                educationScore: 0,
                experienceScore: 0,
                skillsScore: 0
            }
        };
    }
}

// Example usage
const exampleCandidate = {
    education: "Bachelor's",
    yearsOfExperience: 3,
    skills: ["JavaScript", "HTML", "CSS", "Node.js"],
    major: "Computer Science"
};

const exampleJobRequirements = {
    minEducation: "Bachelor's",
    minExperience: 2,
    requiredSkills: ["JavaScript", "HTML", "CSS"],
    category: "Technology",
    majorEqv: "Computer Science"
};

// Test the function
const result = AIscreening(exampleCandidate, exampleJobRequirements);

// Export the function for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AIscreening };
} 