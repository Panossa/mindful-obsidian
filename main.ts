import { Plugin } from 'obsidian';

export default class MindfulObsidian extends Plugin {
	async onload() {
		this.registerEvent(this.app.workspace.on("file-menu", () => {
			console.log('Opened context menu');
		}));
	}
}