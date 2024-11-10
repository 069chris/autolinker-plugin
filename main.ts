import {
	App,
	Editor,
	FileSystemAdapter,
	MarkdownView,
	Modal,
	Notice,
	Plugin,
	PluginSettingTab,
	Setting,
	TFile,
	Vault,
} from "obsidian";

export default class AutoLinkPlugin extends Plugin {
	async onload() {
		this.addCommand({
			id: "auto-link-words",
			name: "Auto-link Words from open file to Existing Files",
			hotkeys: [],
			callback: () => this.autoLinkWords(this.getActiveFile()),
		});
		this.addCommand({
			id: "auto-link-files",
			name: "Auto-link files to each other",
			hotkeys: [],
			callback: () => this.linkAllFiles(),
		});
	}

	getActiveFile(): TFile | null {
		return this.app.workspace.getActiveFile();
	}

	extractWords(text: string): string[] {
		//new Notice(`${text.match(/(?<!\[\[)\b[äöüÄÖÜßa-zA-Z]{2,}\b(?!\]\])/g)}`)
		return text.match(/(?<!\[\[)\b[äöüÄÖÜßa-zA-Z]{2,}\b(?!\]\])/g) || [];
	}


	linkAllFiles(){
		const allFiles = this.app.vault.getMarkdownFiles();
		allFiles.forEach(file => {
			this.autoLinkWords(file)
		});
	}

	async autoLinkWords(file: TFile| null) {
		if (!file) return;

		// Get all files in the vault
		const allFiles = this.app.vault.getMarkdownFiles();
		const fileNames = new Set(allFiles.map((file) => file.basename));

		// Read content of the active file
		const fileContent = await this.app.vault.read(file);

		// Regex to match words that are not already linked and consist only of letters (incl. Umlaute)
		const wordRegex = /\b(?!\[\[)([äöüÄÖÜßa-zA-Z]{2,})(?!\]\])\b/g;

		// Process each match and add links where applicable
		const updatedContent = fileContent.replace(wordRegex, (match) => {
			// Check if the match corresponds to an existing file name and is not already linked
			if (fileNames.has(match)) {
				return `[[${match}]]`; // Add double brackets around the word to link it
			}
			return match; // Return the word unchanged if no match
		});

		// Update the file with new content
		await this.app.vault.modify(file, updatedContent);
		new Notice("Auto-Linking Complete!");
	}
}

