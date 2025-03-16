// InfoMarker is extended MarkerMp, which can contain also: label and colshape
export default class InfoMarker {
	private _marker: MarkerMp;
	private _label: TextLabelMp | undefined;
	private _colshape: ColshapeMp | undefined;
	private _position: Vector3;

	constructor(position: Vector3, markerType: number, markerColor: Array4d, labelText?: string, dimension: number = 1, colshape?: ColshapeMp) {
		this._position = position;

		this._marker = mp.markers.new(markerType, position, 1, {
			color: markerColor
		});

		if (labelText && labelText.length > 0) {
			this._label = mp.labels.new(labelText, new mp.Vector3(position.x, position.y, position.z + 2), {
				los: true, // Visible only in Line of Sight
				font: 4,
				drawDistance: 10,
				dimension: dimension
			});
		}

		if (colshape) {
			this._colshape = colshape;
		}
	}

	// Destructor
	destroy() {
		if (this._colshape) this._colshape.destroy();
		if (this._label) this._label.destroy();
		this._marker.destroy();
	}

	public get position(): Vector3 {
		return this._position;
	}

	public get label(): string {
		if (!this._label?.text) return ""
		return this._label?.text;
	}

	public set label(text: string) {
		if (this._label) {
			this._label.text = text;
		}
	}

	public get color(): Array4d {
		return this._marker.getColor() as Array4d;
	}

	public set color(color: Array4d) {
		this._marker.setColor(...color);
	}

	public showFor(player: PlayerMp) {
		this._marker.showFor(player);
	}

	public hideFor(player: PlayerMp) {
		this._marker.hideFor(player);
	}
}
