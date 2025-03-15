export default class InfoMarker {
  private _marker: MarkerMp;
  private _label: TextLabelMp | undefined;
  private _colshape: ColshapeMp | undefined;
  private _position: Vector3;

  constructor(
    position: Vector3, 
    markerType: number, 
    markerColor: Array4d, 
    labelText?: string, 
    dimension: number = 1,
    colshape?: ColshapeMp) {
    
    this._position = position;

    this._marker = mp.markers.new(
      markerType,
      new mp.Vector3(position.x, position.y, position.z),
      1,
      {
          color: markerColor,
      }
      );

    if (labelText && labelText.length > 0) {
      this._label = mp.labels.new(
        labelText,
        position,
        {
            los: true, // Visible only in Line of Sight
            font: 4,
            drawDistance: 10,
            dimension: dimension
        }
      );
    }

    if (colshape) {
      this._colshape = colshape;
    }
  }

  destroy() {
    if (this._colshape) this._colshape.destroy();
    if (this._label) this._label.destroy();
    this._marker.destroy();
  }

  
  public get position(): Vector3 {
    return this._position
  }

  public set label(text: string) {    
    if (this._label) {      
      this._label.text = text
    }
  }
}