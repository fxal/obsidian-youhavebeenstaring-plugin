import { App, Modal, Notice, Plugin, PluginSettingTab, Setting} from 'obsidian';

export default class YouHaveBeenStaring extends Plugin {
	initialLoadTimestamp: number;
	statusBarItem: HTMLElement;

	async onload() {
		this.initialLoadTimestamp = Date.now();
		this.statusBarItem = this.addStatusBarItem();
		this.registerInterval(window.setInterval(() => this.showTimeSinceLoad(), 1000));
	}

	showTimeSinceLoad(): void {
		if(this.initialLoadTimestamp) {
			let moment = (window as any).moment
			let fromNow = moment(this.initialLoadTimestamp).fromNow(true);
			this.statusBarItem.setText(`You have been staring at your vault for ${fromNow}`);
		}
	}

}

