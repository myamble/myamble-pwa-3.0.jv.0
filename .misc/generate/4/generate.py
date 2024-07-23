import random
import anthropic
import os
import json
import logging
from rich.logging import RichHandler
from rich.console import Console

# Create a rich console object
console = Console()

# Setup basic configuration for logging with RichHandler
logging.basicConfig(
    # level=logging.DEBUG,
    format="%(asctime)s - %(levelname)s - %(message)s",
    handlers=[RichHandler(console=console), logging.FileHandler("logs.log")],
)

# Initialize the Anthropic client
client = anthropic.Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY"))

# Load the subspecs from a JSON file
with open("input/subspecs.json", "r") as f:
    subspecs = json.load(f)

# System prompt
SYSTEM_PROMPT = """We need to break this down into smaller concerns that we can prompt code generation LLMs with. Please think about ways to split this and then make a section for each 'modularizable' part with the prompt in the code block, followed by any follow up comments for the devs getting the code it generates. Modularize as small as reasonably possible, so this usually means one prompt per page or a service. Be verbose and thorough. You will be prompting claude-sonnet-3.5 (if that matters)."""

with open("input/context", "r", encoding="utf-8") as f:
    BIG_FAT_DESIGN_SPEC = f.read()

# Dictionary to store outputs
outputs = {}


# Function to read existing subspecs and populate the outputs dictionary
def initialize_outputs():
    for subspec in subspecs:
        subspec_path = f"output/{subspec['name']}.md"
        if os.path.exists(subspec_path):
            with open(subspec_path, "r", encoding="utf-8") as file:
                outputs[subspec["name"]] = file.read()
    console.log(f"Loaded {len(outputs)} existing subspecs into memory.")


# Function to generate a single subspec
def generate_subspec(subspec):
    max_retries = 3  # Maximum number of retries
    attempt = 0
    while attempt < max_retries:
        try:
            console.log(f"Starting generation for {subspec['name']}")

            # Prepare the dependencies content
            dependencies_content = []
            for dep in subspec["dependencies"]:
                dep_content = outputs.get(dep)
                if dep_content:
                    dependencies_content.append(f"{dep}: {dep_content}")
                else:
                    console.log(
                        f"Warning: Dependency {dep} for {subspec['name']} not found or empty",
                        style="bold yellow",
                    )

            message = client.messages.create(
                model="claude-3-sonnet-20240229",
                max_tokens=4096,
                temperature=0,
                system=SYSTEM_PROMPT,
                messages=[
                    {
                        "role": "user",
                        "content": f"<context>{BIG_FAT_DESIGN_SPEC}</context>\n\nGenerate a detailed prompt for the following subspec: {subspec['name']}\n\nRequirements: {subspec['requirements']}\n\nDependencies: {', '.join(dependencies_content)}",
                    },
                ],
            )
            message = [section.text for section in message.content]
            console.log(f"Successfully generated subspec for {subspec['name']}")

            # Store the generated subspec in the outputs dictionary
            outputs[subspec["name"]] = message

            with open(f"output/{subspec['name']}.md", "w", encoding="utf-8") as file:
                file.write("\n".join(message))

            return subspec["name"], message
        except Exception as e:
            print("ERROR", type(e), e)
            console.log(
                f"Attempt {attempt + 1} failed for {subspec['name']}: {str(e)}",
                style="bold red",
            )
            attempt += 1
            if attempt == max_retries:
                console.log(
                    f"Max retries reached for {subspec['name']}. Giving up.",
                    style="bold red",
                )
                return subspec["name"], None


# Function to check if all dependencies of a subspec are satisfied
def dependencies_satisfied(subspec):
    return all(dep in outputs for dep in subspec["dependencies"])


# Main function to generate all subspecs
def generate_all_subspecs():
    # Initialize outputs with existing subspecs
    initialize_outputs()

    remaining_subspecs = subspecs.copy()
    successful_generations = []
    failed_generations = []

    console.log("Starting the generation of all subspecs")
    while remaining_subspecs:
        for subspec in remaining_subspecs:
            if dependencies_satisfied(subspec):
                name, content = generate_subspec(subspec)
                if content is not None:
                    successful_generations.append(name)
                else:
                    failed_generations.append(name)
                remaining_subspecs.remove(subspec)
                break
        else:
            console.log(
                "Unable to proceed. Circular dependency or missing subspecs.",
                style="bold red",
            )
            break

    console.log(f"Successfully generated {len(successful_generations)} new subspecs.")
    console.log(f"Failed to generate {len(failed_generations)} subspecs.")

    if failed_generations:
        console.log("Failed subspecs:", style="bold red")
        for name in failed_generations:
            console.log(f"- {name}", style="red")


# Run the main function
if __name__ == "__main__":
    generate_all_subspecs()
