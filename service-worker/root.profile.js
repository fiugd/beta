export const profile = () => {
	return `
# configure prompt here
# https://phoenixnap.com/kb/change-bash-prompt-linux
# http://bashrcgenerator.com/

# in the future, parse this and use for prompt
`.trim() + 
'\nexport PS1="[\\033[38;2;60;180;190m\h[\\033[39m [\\033[38;2;0;255;0m\W[\\033[39m\n[\\033[37m[\\033[1m\$ [\\033[0m"' +
'\n';
}