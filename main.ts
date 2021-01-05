import { App, Modal, Notice, Plugin, PluginSettingTab, Setting} from 'obsidian';

export default class YouHaveBeenStaring extends Plugin {
	initialLoad: number;
	statusBarItem: HTMLElement;

	async onload() {
		console.log('loading plugin');
		this.initialLoad = Date.now();
		this.statusBarItem = this.addStatusBarItem();
		this.registerInterval(window.setInterval(() => this.showTimeSinceLoad(), 1000));
	}

	showTimeSinceLoad(): void {
		if(this.initialLoad) {
			let moment = (window as any).moment
			let fromNow = moment(this.initialLoad).fromNow(true);
			this.statusBarItem.setText(`You have been staring at your vault for ${fromNow}`);
		}
	}

}

