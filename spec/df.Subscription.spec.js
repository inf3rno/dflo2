var df = require("../df");

describe("df", function () {

    var Publisher = df.Publisher;
    var Subscriber = df.Subscriber;
    var Subscription = df.Subscription;
    var InvalidArguments = df.InvalidArguments;

    describe("Subscription", function () {


        describe("instance", function () {

            it("requires arguments", function () {

                expect(function () {
                    Subscription.instance();
                }).toThrow(new InvalidArguments.Empty());

            });

            it("accepts configuration options", function () {

                var subscription = Subscription.instance({
                    publisher: new Publisher(),
                    subscriber: new Subscriber({
                        callback: function () {
                        }
                    })
                });
                expect(subscription instanceof Subscription).toBe(true);
            });

            it("accepts publisher as first and subscriber as second argument", function () {

                var publisher = new Publisher();
                var subscriber = new Subscriber({
                    callback: function () {
                    }
                });
                var subscription = Subscription.instance(publisher, subscriber);
                expect(subscription instanceof Subscription);
                expect(subscription.publisher).toBe(publisher);
                expect(subscription.subscriber).toBe(subscriber);

            });

            it("declines too many arguments", function () {

                expect(function () {
                    Subscription.instance(
                        new Publisher(),
                        new Subscriber({
                            callback: function () {
                            }
                        }),
                        new Subscriber({
                            callback: function () {
                            }
                        })
                    );
                }).toThrow(new InvalidArguments());

            });

            it("declines invalid arguments", function () {

                expect(function () {
                    Subscription.instance([function () {
                    }]);
                }).toThrow(new InvalidArguments());

                expect(function () {
                    Subscription.instance(null);
                }).toThrow(new InvalidArguments());

                expect(function () {
                    Subscription.instance(1);
                }).toThrow(new InvalidArguments());

            });

            it("accepts Subscription instance and returns it", function () {

                var subscription = new Subscription({
                    publisher: new Publisher(),
                    subscriber: new Subscriber({
                        callback: function () {
                        }
                    })
                });
                var subscription2 = Subscription.instance(subscription);
                expect(subscription2).toBe(subscription);

            });

            it("accepts Publisher and Subscriber instantiation arguments instead of complete instances", function () {

                var log = jasmine.createSpy();
                var subscription = Subscription.instance({}, log);
                expect(log).not.toHaveBeenCalled();
                subscription.publisher.publish([1, 2, 3]);
                expect(log).toHaveBeenCalledWith(1, 2, 3);
            });

            it("returns Descendant instances by inheritation", function () {

                var log = jasmine.createSpy();
                var Descendant = Subscription.extend({
                    init: log
                });
                var options = {
                    publisher: new Publisher(),
                    subscriber: new Subscriber({
                        callback: function (){}
                    })
                };
                expect(log).not.toHaveBeenCalled();
                var instance = Descendant.instance(options);
                expect(log).toHaveBeenCalledWith(options);
                expect(instance instanceof Descendant);
            });

        });


        describe("init", function () {

            it("requires a publisher and a subscriber", function () {

                var publisher = new Publisher();
                var mockSubscriber = Object.create(Subscriber.prototype);

                expect(function () {
                    var subscription = new Subscription({
                        subscriber: mockSubscriber
                    });
                }).toThrow(new Subscription.PublisherRequired());


                expect(function () {
                    var subscription = new Subscription({
                        publisher: publisher
                    });
                }).toThrow(new Subscription.SubscriberRequired());

                expect(function () {
                    var subscription = new Subscription({
                        publisher: publisher,
                        subscriber: mockSubscriber
                    });
                }).not.toThrow();
            });

            it("generates an id", function () {

                var publisher = new Publisher();
                var mockSubscriber = Object.create(Subscriber.prototype);

                expect(new Subscription({
                    publisher: publisher,
                    subscriber: mockSubscriber
                }).id).not.toEqual(Subscription.prototype.id);
            });

            it("adds the subscription to the publisher", function () {

                var mockPublisher = Object.create(Publisher.prototype);
                mockPublisher.addSubscription = jasmine.createSpy();
                var mockSubscriber = Object.create(Subscriber.prototype);

                expect(mockPublisher.addSubscription).not.toHaveBeenCalled();
                var subscription = new Subscription({
                    publisher: mockPublisher,
                    subscriber: mockSubscriber
                });
                expect(mockPublisher.addSubscription).toHaveBeenCalledWith(subscription);
            });

        });

        describe("notify", function () {

            it("requires the array of arguments", function () {

                var publisher = new Publisher();
                var mockSubscriber = Object.create(Subscriber.prototype);
                var subscription = new Subscription({
                    publisher: publisher,
                    subscriber: mockSubscriber
                });

                expect(function () {
                    subscription.notify();
                }).toThrow(new Subscription.ArrayRequired());

            });

            it("notifies the subscriber", function () {

                var publisher = new Publisher();
                var mockSubscriber = Object.create(Subscriber.prototype);
                mockSubscriber.receive = jasmine.createSpy();

                var subscription = new Subscription({
                    publisher: publisher,
                    subscriber: mockSubscriber
                });

                expect(mockSubscriber.receive).not.toHaveBeenCalled();
                subscription.notify([1, 2, 3]);
                expect(mockSubscriber.receive).toHaveBeenCalledWith([1, 2, 3]);
            });

        });

    });
});