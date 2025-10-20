package com.university.lms.util;
import jakarta.xml.bind.JAXBContext;
import jakarta.xml.bind.JAXBException;
import jakarta.xml.bind.Unmarshaller;
import javax.xml.XMLConstants;
import javax.xml.validation.Schema;
import javax.xml.validation.SchemaFactory;

import org.xml.sax.SAXException;

import com.university.lms.entity.User;

import java.io.File;

public class XmlImporter {

    public static <T> T importFromXml(String xmlPath, Class<T> clazz, String schemaPath) throws JAXBException, SAXException {
        JAXBContext context = JAXBContext.newInstance(clazz);
        Unmarshaller unmarshaller = context.createUnmarshaller();

        if (schemaPath != null && !schemaPath.isEmpty()) {
            SchemaFactory sf = SchemaFactory.newInstance(XMLConstants.W3C_XML_SCHEMA_NS_URI);
            Schema schema = sf.newSchema(new File(schemaPath));
            unmarshaller.setSchema(schema);
        }

        return (T) unmarshaller.unmarshal(new File(xmlPath));
    }

    public static User importUserFromXml(String xmlPath) throws JAXBException, SAXException {
        return importFromXml(xmlPath, User.class, "src/main/resources/schemas/user.xsd");
    }
}