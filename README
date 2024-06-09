This project is a proof-of-conept for demonstrating a solution to tight binding to the internal data models between two web services that must communicate.

The current state of the art is binding _directly_ to client or server internal data models such that any _structural_ changes to messages are breaking changes, no matter how superficial those changes might be. This is true even in cases where the **meaning** of hte message remains the same.

In a typical scenario changing a field name like `firstName` to `FirstName` would instantly break clients or servers although the meaning of the data remains unchanged. 

Replicated across codebases and services and this practice results in incalulable developer toil, maintenance burden, product fragility and failed business objectives.

## How Can We Address This?

What follows is a modest proposal for building highly adaptive web services in three pieces. Combined, these pieces will allow us to create services that can adapt and absorb changes in their operation conditions without breaking. 

The three fundamental pieces are:

* Interface Schemas
* Self-Describing Messages
* JSON Patch specification

With these three pieces we have all we need to reduce tight coupling to data models between clients and servers and increads the flexibility of web service architecture.

### Interface Schemas
This is a standardized schema used _between_ services for data exchange. It defines the agreed-upon structure and fields of interest, ensuring that the data transmitted between services meets expected formats and content. 

The crucial aspect of this concept is that while the Interface Schema dictates how data is exchanged externally, it allows the internal data structures of each service to remain opaque and independently managed.

By way of the Interface Schema we ensure the meaning of messages remains stable _between_ services while allowing communicating services to internally evolve according their needs.


### Self-Describing Messages
These are data that has been annotated by the producer so that all consumers can interpret an used the data properly.

This is key idea because all the information for message processing and semantics are embedded in or accompanied by the message itself. Therefore, servers and clients need less hard-coded knowledge about message structure and semantics. This is what opens clients and servers up for adaptation.

### JSON Patch
This is a format for describing changes to JSON documents.JSON Patch documents are just JSON files containing a list of patch operations on some specific JSON data (e.g. "add", "remove", "move", and so on).

Using this specification helps us create adaptable web services because we can provide instructions on how to translate our messages to specified structure to consumers of our messages.

Because JSON Patch documents are just JSON, they can be serialized and sent over the wire. We can include the patch document as metadata embedded in the message payload or we can provide the consumer a link to a JSON Patch file they can download and apply to our message.

Armed with our message and the means to translate it, our message consumers have all they need to process the message successfully. We have created a self-describing message.

### Tying it All Together

We can increase the adaptability of our web services and clients using the concepts outlined above as follows:

1. Clients and servers agree on an Interface Schema. This can be a semi-flat object containing the fields of interest to both parties. In a typical use case clients and servers would agree to a message structure like:

```
{ "clientFirstName": "Aristotle" }
```
> Recall: the Interface Schema is **only** used to transfer data; neither client **nor** server depend on this schema for business logic--only transfer and translation of messages

2. Clients send messages in their chosen structure but also include metadata in the form of a JSON Patch document for translation to the agreed upon Interface Schema. An example patch might be: 

```
[{
    "op": "move",
    "from": "/name",
    "path": "/clientFirstName"
}]
```

This patch allows the server to translate from the client model to the interface model.

3. Servers receive the client message and use the provided metadata to translate the message to the Interface Schema. After the patch is applied, the outbound message from the client:
```
{ "name": "Aristotle" }
```
becomes:

```
{ "clientFirstName": "Socrates" }
```
 after which the receiving server can do any further mapping requried for its internal data model.

 This interaction pattern closes the loop allowing client and server data models to be free from one another--making integrations significantly easier and much less error prone.

 >An extension could encompass the client sending the JSON Patch schema required to convert the response from the server _back_ from the Interface Schema to the internal model of the client.

 ### Summary
 The key insight of this project is that when shared understanding between clients and servers becomes the messages exchanged between the two _rather_ than client or server object models, we open up many possibilities for improving service adaptability and resilience in the face of change--which is the only thing we can count on.