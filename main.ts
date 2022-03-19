import { App, Plugin, MenuItem, PluginSettingTab, Setting } from 'obsidian';
import { around } from 'monkey-around';

interface VerboseSettings {
	// Whether important buttons should be highlighted. E.g. "Delete"
	mindfulObsidian: boolean;
}

const DEFAULT_SETTINGS: VerboseSettings = {
	mindfulObsidian: true
}

export default class VerboseStylizer extends Plugin {
	settings: VerboseSettings;

	async onload() {
		await this.loadSettings();

		this.register(around(MenuItem.prototype, {
			setTitle(old) { 
				return function(title: string | DocumentFragment) {
					this.dom.dataset.stylizerTitle = String(title);
					return old.call(this, title);
				}; 
			}
		}));

		this.register(around(MenuItem.prototype, {
			setIcon(old) { 
				return function(icon: string | DocumentFragment) {
					this.dom.dataset.stylizerIcon = String(icon);

					if (this.menu.app.plugins.plugins['verbose-stylizer'].settings.mindfulObsidian && icon === 'trash') {
						this.dom.addClass('stylize-error');
					}

					return old.call(this, icon);
				}; 
			}
		}));

		this.addSettingTab(new StylizerSettingTab(this.app, this));
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class StylizerSettingTab extends PluginSettingTab {
	plugin: VerboseStylizer;

	constructor(app: App, plugin: VerboseStylizer) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();
		containerEl.createEl('h2', {text: 'Settings for this plugin.'});

		new Setting(containerEl)
			.setName('Highlight important decisions.')
			.setDesc('This will highlight potentially critical actions such as "Delete" on a file.')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.mindfulObsidian)
				.onChange(async (value) => {
					this.plugin.settings.mindfulObsidian = value;
					await this.plugin.saveSettings();
			}))
	}
}