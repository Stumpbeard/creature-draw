import json

from flask import Flask, jsonify, redirect, render_template, request, url_for
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///creature.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
db = SQLAlchemy(app)


class Part(db.Model):
    __tablename__ = "parts"

    id = db.Column(db.Integer, primary_key=True)
    section = db.Column(db.String)
    image_data = db.Column(db.String)
    history = db.Column(db.String)


class Creature(db.Model):
    __tablename__ = "creatures"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, nullable=False)
    head_id = db.Column(db.Integer, db.ForeignKey("parts.id"), nullable=False)
    body_id = db.Column(db.Integer, db.ForeignKey("parts.id"))
    legs_id = db.Column(db.Integer, db.ForeignKey("parts.id"))

    head = db.relationship("Part", backref="creatures_head", foreign_keys=[head_id])
    body = db.relationship("Part", backref="creatures_body", foreign_keys=[body_id])
    legs = db.relationship("Part", backref="creatures_legs", foreign_keys=[legs_id])


db.create_all()


@app.route("/")
def home():
    creatures = Creature.query.all()

    return render_template(
        "index.html",
        needing_bodies=[creature for creature in creatures if creature.body is None],
        needing_legs=[
            creature
            for creature in creatures
            if creature.body is not None and creature.legs is None
        ],
        finished_creatures=[
            creature for creature in creatures if creature.legs is not None
        ],
    )


@app.route("/<creature_id>/<part>/")
def add_part(creature_id, part):
    creature = Creature.query.get(creature_id)
    part_data = None
    if part == "body":
        part_data = creature.head.image_data
    if part == "legs":
        part_data = creature.body.image_data

    return render_template(
        "part-draw.html", creature=creature, part=part, part_data=part_data
    )


@app.route("/new-creature/", methods=["POST"])
def create_new_creature():
    req = request.form
    new_part = Part(
        section=req["section"],
        image_data=json.dumps(req["image"]),
        history=json.dumps(req["history"]),
    )
    db.session.add(new_part)
    db.session.flush()
    new_creature = Creature(name=req["name"], head_id=new_part.id)
    db.session.add(new_creature)
    db.session.commit()
    return redirect(url_for("home"))


@app.route("/update-creature/", methods=["POST"])
def update_creature():
    req = request.form
    creature = Creature.query.get(req["creature_id"])
    new_part = Part(
        section=req["section"],
        image_data=json.dumps(req["image"]),
        history=json.dumps(req["history"]),
    )
    db.session.add(new_part)
    db.session.flush()
    if req["section"] == "body":
        creature.body_id = new_part.id
    if req["section"] == "legs":
        creature.legs_id = new_part.id
    db.session.commit()

    return redirect(url_for("home"))


@app.route("/finished/<id>")
def finished_creature(id):
    creature = Creature.query.get(id)

    return render_template(
        "finished.html",
        creature=creature,
        head_data=creature.head.image_data,
        body_data=creature.body.image_data,
        legs_data=creature.legs.image_data,
        head_history=creature.head.history,
        body_history=creature.body.history,
        legs_history=creature.legs.history,
    )
