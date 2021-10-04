export const profile = () => {
	return `
# configure prompt here
# https://phoenixnap.com/kb/change-bash-prompt-linux
# http://bashrcgenerator.com/

# in the future, parse this and use for prompt
`.trim() + 
	'\nexport PS1="\[\\033[38;5;14m\]\h\[$(tput sgr0)\] \[$(tput sgr0)\]\[\\033[38;5;2m\]\W\[$(tput sgr0)\]\n\\$ \[$(tput sgr0)\]"' +
	`\n`;
}